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
  /*
    The following query filters for AAPs based on the following criteria:
    - Must have at least one onsite department.
    - Must not belong to the "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC" category.
    - Must have a non-null 'll_to_earth' value.
  */
  const organisms: Organism[] = await prismaClient.$queryRawUnsafe(`
    SELECT o.*, (earth_distance(ll_to_earth(${latitude},${longitude}), o.ll_to_earth::earth) / 1000) AS distance_km FROM organism o
    INNER JOIN organism_informations_commerciales oic ON o.id = oic.organism_id
    INNER JOIN organism_department od ON o.id = od.organism_id
    WHERE od.is_onsite = true 
    AND o.ll_to_earth IS NOT NULL 
    AND oic."conformeNormesAccessbilite" != 'ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC'
    ${searchText ? `AND o.label ILIKE '%${searchText}%'` : ""}
    ORDER BY distance_km ASC
    LIMIT ${limit}
    `);

  if (!organisms?.length) {
    return [];
  }

  return organisms.map(
    (o) => mapKeys(o, (_, k) => camelCase(k)) //mapping rawquery output field names in snake case to camel case
  ) as unknown as OrganismCamelCase[];
};
