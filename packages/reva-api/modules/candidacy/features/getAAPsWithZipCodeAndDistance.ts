import { Organism } from "@prisma/client";
import { camelCase, mapKeys } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { Organism as OrganismCamelCase } from "../../organism/organism.types";

export const getAAPsWithZipCodeAndDistance = async ({
  distance,
  zip,
  city,
  limit,
  searchText,
}: {
  city?: string;
  zip?: string;
  distance: number;
  searchText?: string;
  limit: number;
}) => {
  const query = `https://api-adresse.data.gouv.fr/search/?q=${
    city ?? "centre"
  }${zip ? `&postcode=${zip}` : ""}&limit=1`;
  const res = (await fetch(query)) as any;
  const { features } = await res.json();

  if (!features.length) {
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
    WHERE (earth_distance(ll_to_earth(${latitude},${longitude}), o.ll_to_earth::earth) / 1000) < ${distance}
    ${searchText ? `AND o.label ILIKE '%${searchText}%'` : ""}
    AND o.contact_administrative_email IS NOT NULL
    ORDER BY (earth_distance(ll_to_earth(${latitude},${longitude}), o.ll_to_earth::earth) / 1000) ASC
    LIMIT ${limit}
    `);

  if (!organisms.length) {
    return [];
  }

  return organisms.map(
    (o) => mapKeys(o, (_, k) => camelCase(k)) //mapping rawquery output field names in snake case to camel case
  ) as unknown as OrganismCamelCase[];
};
