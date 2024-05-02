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
  pmr,
  limit,
  searchText,
  distanceStatus,
}: {
  zip: string;
  pmr?: boolean;
  limit: number;
  searchText?: string;
  distanceStatus?: string;
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
    - Must have a non-null 'll_to_earth', 'adresse_numero_et_nom_de_rue', 'adresse_code_postal', 'adresse_ville' values.
  */
  const organisms: Organism[] = await prismaClient.$queryRawUnsafe(`
      SELECT DISTINCT(o.*),
                     (earth_distance(ll_to_earth(${latitude}, ${longitude}), o.ll_to_earth::earth) /
                      1000) AS distance_km
      FROM organism o
               INNER JOIN organism_informations_commerciales oic ON o.id = oic.organism_id
               INNER JOIN organism_department od ON o.id = od.organism_id
      WHERE od.is_onsite = true ${
        distanceStatus === "ONSITE_REMOTE" ? `AND od.is_remote = true` : ""
      }
        AND o.ll_to_earth IS NOT NULL
        AND oic."adresse_numero_et_nom_de_rue" IS NOT NULL
        AND oic."adresse_code_postal" IS NOT NULL
        AND oic."adresse_ville" IS NOT NULL
        AND oic."conformeNormesAccessbilite" ${
          pmr ? `= 'CONFORME'` : `!= 'ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC'`
        } ${searchText ? `AND o.label ILIKE '%${searchText}%'` : ""}
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
