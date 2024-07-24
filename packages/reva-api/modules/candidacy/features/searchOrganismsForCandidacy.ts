import { getFeatureByKey } from "../../feature-flipping/feature-flipping.features";
import { prismaClient } from "../../../prisma/client";
import { SearchOrganismFilter } from "../candidacy.types";
import { getLastProfessionalCgu } from "../../organism/features/getLastProfessionalCgu";
import { camelCase, mapKeys } from "lodash";
import { Organism, RemoteZone } from "../../organism/organism.types";
import { getDepartmentById } from "../../referential/features/getDepartmentById";

export const searchOrganismsForCandidacy = async ({
  candidacyId,
  searchFilter,
  searchText,
}: {
  candidacyId: string;
  searchFilter: SearchOrganismFilter;
  searchText?: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      organism: true,
      certificationsAndRegions: {
        select: {
          certificationId: true,
        },
        where: {
          isActive: true,
        },
      },
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  let organismsFound: Organism[];

  if (
    searchFilter.zip &&
    searchFilter.zip.length === 5 &&
    searchFilter?.distanceStatus === "ONSITE"
  ) {
    organismsFound = await getAAPsWithZipCode({
      certificationId:
        candidacy?.certificationsAndRegions[0]?.certificationId || "",
      zip: searchFilter.zip,
      pmr: searchFilter.pmr,
      limit: 50,
      searchText,
    });
  } else {
    if (!candidacy.departmentId) {
      throw new Error("Cette candidature n'est pas associée à un département");
    }
    const result = await getRandomActiveOrganismForCertification({
      certificationId: candidacy.certificationsAndRegions[0].certificationId,
      departmentId: candidacy.departmentId,
      searchText,
      searchFilter,
      limit: 50,
    });

    organismsFound = result.rows
      .filter((r) => r.id !== candidacy?.organism?.id)
      .slice(0, 50);
  }

  return {
    totalRows: organismsFound?.length ?? 0,
    rows: organismsFound,
  };
};

const getRandomActiveOrganismForCertification = async ({
  certificationId,
  departmentId,
  searchText,
  searchFilter,
  limit,
}: {
  certificationId: string;
  departmentId: string;
  searchText?: string;
  searchFilter: SearchOrganismFilter;
  limit: number;
}) => {
  let fromClause = `from organism o
    join active_organism_by_available_certification ao on ao.organism_id = o.id
    join maison_mere_aap as mm on mm.id = o.maison_mere_aap_id
   left join organism_informations_commerciales as oic on oic.organism_id = o.id`;

  let whereClause = `where ao.certification_id=uuid('${certificationId}') and (o.is_remote or o.is_onsite)`;

  if (searchText) {
    whereClause += ` and (unaccent(o.label) ilike unaccent($$%${searchText}%$$) or unaccent(oic.nom) ilike unaccent($$%${searchText}%$$))`;
  }

  if (searchFilter.distanceStatus === "REMOTE") {
    const candidacyDepartmentRemoteZone = await getRemoteZoneFromDepartment({
      departmentId,
    });
    whereClause += " and o.is_remote=true";
    fromClause += ` join organism_on_remote_zone as orz on (orz.organism_id = o.id and orz.remote_zone = '${candidacyDepartmentRemoteZone}')`;
  }
  if (searchFilter.distanceStatus === "ONSITE") {
    whereClause += `
          and o.is_onsite = true
          `;
  }

  const isCGUAcceptanceRequired = (await getFeatureByKey("AAP_CGU"))?.isActive;
  if (isCGUAcceptanceRequired) {
    const CGU_AAP_VERSION = (await getLastProfessionalCgu())?.version;
    if (CGU_AAP_VERSION != undefined) {
      whereClause += ` and mm."cgu_version" = '${CGU_AAP_VERSION}' `;
    }
  }

  const queryResults = `
          select o.id,
                 o.label,
                 o.legal_status,
                 o.contact_administrative_email,
                 o.contact_administrative_phone,
                 o.website,
                 o.siret,
                 o.is_onsite as "isOnSite",
                 o.is_remote,
                 ao.organism_id
            ${fromClause}
            ${whereClause}
          order by Random() limit ${limit}`;

  const results = (
    await prismaClient.$queryRawUnsafe<Organism[]>(queryResults)
  ).map(
    (o) => mapKeys(o, (_, k) => camelCase(k)), //mapping rawquery output field names in snake case to camel case
  ) as unknown as Organism[];

  const queryCount = `
          select count(distinct (o.id))
            ${fromClause}
            ${whereClause}`;

  const count = Number(
    (await prismaClient.$queryRawUnsafe<{ count: number }[]>(queryCount))[0]
      .count,
  );

  return { rows: results, totalRows: count };
};

const getAAPsWithZipCode = async ({
  zip,
  certificationId,
  limit,
  pmr,
  searchText,
}: {
  zip: string;
  certificationId: string;
  limit: number;
  pmr?: boolean;
  searchText?: string;
}) => {
  const query = `https://api-adresse.data.gouv.fr/search/?q=centre&postcode=${zip}&limit=1`;
  const res = await fetch(query);
  const {
    features,
  }: {
    features: [
      {
        geometry: {
          type: string;
          coordinates: [number, number];
        };
      },
    ];
  } = await res.json();

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
  and o.is_onsite = true
  and ao.certification_id=uuid('${certificationId}')
  and o.ll_to_earth IS NOT NULL
  and (oic."adresse_numero_et_nom_de_rue" IS NOT NULL or oic."adresse_numero_et_nom_de_rue" != '')
  and (oic."adresse_code_postal" IS NOT NULL or oic."adresse_code_postal" != '')
  and (oic."adresse_ville" IS NOT NULL or oic."adresse_ville" != '')
  `;

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
    const CGU_AAP_VERSION = (await getLastProfessionalCgu())?.version;
    if (CGU_AAP_VERSION != undefined) {
      whereClause += ` and mm."cgu_version" = '${CGU_AAP_VERSION}' `;
    }
  }

  const organisms: Organism[] = await prismaClient.$queryRawUnsafe(`
      SELECT DISTINCT(o.*),o.is_onsite as "isOnSite", (earth_distance(ll_to_earth(${latitude}, ${longitude}), o.ll_to_earth::earth) / 1000) AS distance_km
      FROM organism o
       JOIN organism_informations_commerciales oic ON o.id = oic.organism_id
       JOIN maison_mere_aap mm ON mm.id = o.maison_mere_aap_id
       JOIN active_organism_by_available_certification ao on ao.organism_id=o.id
      ${whereClause}
      ORDER BY distance_km ASC
      LIMIT ${limit}
  `);

  if (!organisms?.length) {
    return [];
  }

  return organisms.map(
    (o) => mapKeys(o, (_, k) => camelCase(k)), //mapping rawquery output field names in snake case to camel case
  ) as unknown as Organism[];
};

const getRemoteZoneFromDepartment = async ({
  departmentId,
}: {
  departmentId: string;
}): Promise<RemoteZone> => {
  const departement = await getDepartmentById({ id: departmentId });
  switch (departement?.code) {
    case "971":
      return "GUADELOUPE";
    case "972":
      return "MARTINIQUE";
    case "973":
      return "GUYANE";
    case "974":
      return "LA_REUNION";
    case "976":
      return "MAYOTTE";
    default:
      return "FRANCE_METROPOLITAINE";
  }
};
