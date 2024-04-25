import { Organism } from "@prisma/client";
import { camelCase, mapKeys } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { Organism as OrganismCamelCase } from "../../organism/organism.types";

type SearchResponse = {
  features: [
    {
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: {
        label: string;
        score: number;
        housenumber: string;
        id: string;
        type: string;
        name: string;
        postcode: string;
        citycode: string;
        x: number;
        y: number;
        city: string;
        context: string;
        importance: number;
        street: string;
      };
    }
  ];
};

export const getAAPsWithZipCode = async ({
  zip,
  limit,
  searchText,
}: {
  zip: string;
  limit: number;
  searchText?: string;
}) => {
  const query = `https://api-adresse.data.gouv.fr/search/?q=centre&postcode=${zip}&limit=1`;
  const res = await fetch(query);
  const { features }: SearchResponse = await res.json();

  if (!features?.length) {
    return [];
  }

  const [
    {
      geometry: { coordinates },
    },
  ] = features;
  const [longitude, latitude] = coordinates as [number, number];

  const organisms: Organism[] = await prismaClient.$queryRawUnsafe(`
    SELECT o.* FROM organism o
    INNER JOIN organism_informations_commerciales oic ON o.id = oic.organism_id
    ${searchText ? `AND o.label ILIKE '%${searchText}%'` : ""}
    WHERE o.ll_to_earth IS NOT NULL
    ORDER BY (earth_distance(ll_to_earth(${latitude},${longitude}), o.ll_to_earth::earth) / 1000) ASC
    LIMIT ${limit}
    `);

  if (!organisms?.length) {
    return [];
  }

  return organisms.map(
    (o) => mapKeys(o, (_, k) => camelCase(k)) //mapping rawquery output field names in snake case to camel case
  ) as unknown as OrganismCamelCase[];
};
