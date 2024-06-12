import { Organism } from "@prisma/client";
import { camelCase, mapKeys } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { Organism as OrganismCamelCase } from "../../organism/organism.types";
import { getFeatureByKey } from "../../feature-flipping/feature-flipping.features";
import { getLastProfessionalCgu } from "../../organism/features/getLastProfessionalCgu";

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
    },
  ];
};

export const getAAPsWithZipCode = async ({
  zip,
  certificationId,
  limit,
  pmr,
  searchText,
  distanceStatus,
}: {
  zip: string;
  certificationId: string;
  limit: number;
  pmr?: boolean;
  searchText?: string;
  distanceStatus?: string;
}) => {
  const query = `https://api-adresse.data.gouv.fr/search/?q=centre&postcode=${zip}&limit=1`;
  const res = await fetch(query);
  const { features }: SearchResponse = await res.json();

  if (!features?.length || !certificationId) {
    return [];
  }

  const [
    {
      geometry: { coordinates },
    },
  ] = features;
  const [longitude, latitude] = coordinates as [number, number];

  /*
    This query filters AAPs with specific conditions:
    - Excludes AAPs categorized under "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC".
    - Ensures the presence of non-null values for 'll_to_earth', 'adresse_numero_et_nom_de_rue', 'adresse_code_postal', 'adresse_ville'.
  */

  let whereClause = `
  where o.id = ao.organism_id
  and od.is_onsite = true
  and ao.certification_id=uuid('${certificationId}')
  and o.ll_to_earth IS NOT NULL
  and (oic."adresse_numero_et_nom_de_rue" IS NOT NULL or oic."adresse_numero_et_nom_de_rue" != '')
  and (oic."adresse_code_postal" IS NOT NULL or oic."adresse_code_postal" != '')
  and (oic."adresse_ville" IS NOT NULL or oic."adresse_ville" != '')
  `;

  if (distanceStatus === "ONSITE_REMOTE") {
    whereClause += ` and od.is_remote = true`;
  }

  if (searchText) {
    whereClause += ` and (unaccent(o.label) ilike unaccent($$%${searchText}%$$) or unaccent(oic.nom) ilike unaccent($$%${searchText}%$$))`;
  }

  if (pmr) {
    whereClause += ` and oic."conformeNormesAccessbilite" = 'CONFORME' `;
  } else {
    whereClause += ` and oic."conformeNormesAccessbilite" != 'ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC'`;
  }

  const isCGUAcceptanceRequired = (await getFeatureByKey("AAP_CGU"))?.isActive;
  if (isCGUAcceptanceRequired) {
    try {
      const CGU_AAP_VERSION = (await getLastProfessionalCgu())?.version;
      if (CGU_AAP_VERSION != undefined) {
        whereClause += ` and mm."cgu_version" = '${CGU_AAP_VERSION}' `;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const organisms: Organism[] = await prismaClient.$queryRawUnsafe(`
      SELECT DISTINCT(o.*), (earth_distance(ll_to_earth(${latitude}, ${longitude}), o.ll_to_earth::earth) / 1000) AS distance_km
      FROM organism o
      INNER JOIN organism_informations_commerciales oic ON o.id = oic.organism_id
      INNER JOIN organism_department od ON o.id = od.organism_id
      INNER JOIN maison_mere_aap mm ON mm.id = o.maison_mere_aap_id
      ,active_organism_by_available_certification_and_department ao
      ${whereClause}
      ORDER BY distance_km ASC
      LIMIT ${limit}
  `);

  if (!organisms?.length) {
    return [];
  }

  return organisms.map(
    (o) => mapKeys(o, (_, k) => camelCase(k)), //mapping rawquery output field names in snake case to camel case
  ) as unknown as OrganismCamelCase[];
};
