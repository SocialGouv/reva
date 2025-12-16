import { Prisma } from "@prisma/client";

import { getLastProfessionalCgu } from "@/modules/organism/features/getLastProfessionalCgu";
import { Organism, RemoteZone } from "@/modules/organism/organism.types";
import { getDepartmentById } from "@/modules/referential/features/getDepartmentById";
import { fetchCoordinatesFromZipCode } from "@/modules/shared/geocoding";
import { prismaClient } from "@/prisma/client";

import { SearchOrganismFilter } from "../candidacy.types";

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
      candidate: { select: { departmentId: true } },
      organism: true,
      cohorteVaeCollective: { include: { organism: true } },
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  // In case of a "VAE collective", if the cohorteVaeCollective restricts the available organisms, user search results are restricted to the organism in the cohorteVaeCollective
  const organismsFromCohorteVaeCollectiveIds = candidacy.cohorteVaeCollective
    ?.organismId
    ? [candidacy.cohorteVaeCollective.organismId]
    : [];

  let organismsFound: Organism[];
  let totalOrganismCount: number;

  if (
    searchFilter.zip &&
    searchFilter.zip.length === 5 &&
    searchFilter?.distanceStatus === "ONSITE"
  ) {
    const result = await getAAPsWithZipCode({
      certificationId: candidacy.certificationId || "",
      zip: searchFilter.zip,
      pmr: searchFilter.pmr,
      limit: 50,
      searchText,
      restrictedToOrganismsIds: organismsFromCohorteVaeCollectiveIds,
    });
    organismsFound = result.rows;
    totalOrganismCount = result.totalRows;
  } else {
    if (!candidacy.candidate?.departmentId) {
      throw new Error("Aucun département n'est associé");
    }

    const result = await getRandomActiveOrganismForCertification({
      certificationId: candidacy.certificationId || "",
      departmentId: candidacy.candidate?.departmentId,
      searchText,
      searchFilter,
      limit: 50,
      restrictedToOrganismsIds: organismsFromCohorteVaeCollectiveIds,
    });

    organismsFound = result.rows.slice(0, 50);
    totalOrganismCount = result.totalRows;
  }

  return {
    totalRows: totalOrganismCount,
    rows: organismsFound,
  };
};

const getRandomActiveOrganismForCertification = async ({
  certificationId,
  departmentId,
  searchText,
  searchFilter,
  limit,
  restrictedToOrganismsIds,
}: {
  certificationId: string;
  departmentId: string;
  searchText?: string;
  searchFilter: SearchOrganismFilter;
  limit: number;
  restrictedToOrganismsIds?: string[];
}) => {
  const organismView =
    "active_organism_by_available_certification_based_on_formacode";

  let fromClause = Prisma.raw(`from organism o
    join ${organismView} ao on ao.organism_id = o.id
    join maison_mere_aap as mm on mm.id = o.maison_mere_aap_id`);

  let whereClause = Prisma.sql`where ao.certification_id=uuid(${certificationId}) and (o.modalite_accompagnement_renseignee_et_valide)`;

  if (searchText) {
    const words = searchText.split(/\s+/);
    const conditions = words.map((word) => {
      const wordWithWildcards = "%" + word + "%";
      return Prisma.sql`(unaccent(o.label) ilike unaccent(${wordWithWildcards}) or unaccent(o.nom_public) ilike unaccent(${wordWithWildcards}))`;
    });

    const conditionsString = Prisma.join(conditions, " and ");
    whereClause = Prisma.sql`${whereClause} and (${conditionsString})`;
  }

  if (searchFilter.distanceStatus === "REMOTE") {
    const candidacyDepartmentRemoteZone = await getRemoteZoneFromDepartment({
      departmentId,
    });
    whereClause = Prisma.sql`${whereClause} and o.modalite_accompagnement='A_DISTANCE'`;
    fromClause = Prisma.raw(
      `${fromClause.sql} join organism_on_remote_zone as orz on (orz.organism_id = o.id and orz.remote_zone = '${candidacyDepartmentRemoteZone}')`,
    );
  }

  if (searchFilter.distanceStatus === "ONSITE") {
    whereClause = Prisma.sql`${whereClause} and o.modalite_accompagnement = 'LIEU_ACCUEIL'`;
  }

  if (searchFilter.isMcfCompatible === true) {
    whereClause = Prisma.sql`${whereClause} and mm.is_mcf_compatible = true`;
  }

  if (searchFilter.pmr) {
    whereClause = Prisma.sql`${whereClause} and o.conforme_norme_accessibilite = 'CONFORME' `;
  }

  if (searchFilter.isAvailable === true) {
    whereClause = Prisma.sql`${whereClause} and o.ferme_pour_absence_ou_conges = false`;
  }

  const CGU_AAP_VERSION = (await getLastProfessionalCgu())?.version;
  if (CGU_AAP_VERSION != undefined) {
    whereClause = Prisma.sql`${whereClause} and mm."cgu_version" = '${Prisma.raw(`${CGU_AAP_VERSION}`)}' `;
  }

  if (restrictedToOrganismsIds?.length) {
    whereClause = Prisma.sql`${whereClause} and o.id::text in (${Prisma.join(
      restrictedToOrganismsIds,
    )})`;
  }

  const results = await prismaClient.$queryRaw<Organism[]>`
          select o.id,
                 o.label,
                 o.nom_public as "nomPublic",
                 o.email_contact as "emailContact",
                 o.telephone as telephone,
                 o.site_internet as "siteInternet",
                 o.adresse_numero_et_nom_de_rue as "adresseNumeroEtNomDeRue",
                 o.adresse_code_postal as "adresseCodePostal",
                 o.adresse_ville as "adresseVille",
                 o.adresse_informations_complementaires as "adresseInformationsComplementaires",
                 o.legal_status as "labelStatus",
                 o.contact_administrative_email as "contactAdministrativeEmail",
                 o.contact_administrative_phone as "contactAdministrativePhone",
                 o.website,
                 o.siret,
                 o.modalite_accompagnement as "modaliteAccompagnement",
                 o.modalite_accompagnement_renseignee_et_valide as "modaliteAccompagnementRenseigneeEtValide",
                 o.maison_mere_aap_id as "maisonMereAAPId",
                 o.ferme_pour_absence_ou_conges as "fermePourAbsenceOuConges",
                 o.conforme_norme_accessibilite as "conformeNormesAccessibilite",
                 ao.organism_id as "organismId"
            ${fromClause}
            ${whereClause}
          order by Random() limit ${limit}`;

  const count = Number(
    (
      await prismaClient.$queryRaw<{ count: number }[]>`
          select count(distinct (o.id))
            ${fromClause}
            ${whereClause}`
    )[0].count,
  );

  return { rows: results, totalRows: count };
};

const getAAPsWithZipCode = async ({
  zip,
  certificationId,
  limit,
  pmr,
  searchText,
  restrictedToOrganismsIds,
}: {
  zip: string;
  certificationId: string;
  limit: number;
  pmr?: boolean;
  searchText?: string;
  restrictedToOrganismsIds?: string[];
}): Promise<{ rows: Organism[]; totalRows: number }> => {
  if (!certificationId) {
    return { rows: [], totalRows: 0 };
  }

  const result = await fetchCoordinatesFromZipCode(zip);

  if (!result.success) {
    return { rows: [], totalRows: 0 };
  }

  const [longitude, latitude] = result.coordinates;

  /*
    This query filters AAPs with specific conditions:
    - Excludes AAPs categorized under "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC".
    - Ensures the presence of non-null values for 'll_to_earth', 'adresse_numero_et_nom_de_rue', 'adresse_code_postal', 'adresse_ville'.
  */

  let whereClause = Prisma.sql`
  where o.id = ao.organism_id
  and o.modalite_accompagnement_renseignee_et_valide = true
  and o.modalite_accompagnement = 'LIEU_ACCUEIL'
  and ao.certification_id=uuid(${certificationId})
  and o.ll_to_earth IS NOT NULL
  and (o.adresse_numero_et_nom_de_rue IS NOT NULL or o.adresse_numero_et_nom_de_rue != '')
  and (o.adresse_code_postal IS NOT NULL or o.adresse_code_postal != '')
  and (o.adresse_ville IS NOT NULL or o.adresse_ville != '')
  `;

  if (searchText) {
    const searchTextWithWildCards = `%${searchText}%`;
    whereClause = Prisma.sql`${whereClause} and (unaccent(o.label) ilike unaccent(${searchTextWithWildCards}) or unaccent(o.nom_public) ilike unaccent(${searchTextWithWildCards}))`;
  }

  if (pmr) {
    whereClause = Prisma.sql`${whereClause} and o.conforme_norme_accessibilite = 'CONFORME' `;
  } else {
    whereClause = Prisma.sql`${whereClause} and o.conforme_norme_accessibilite != 'ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC'`;
  }

  const CGU_AAP_VERSION = (await getLastProfessionalCgu())?.version;
  if (CGU_AAP_VERSION != undefined) {
    whereClause = Prisma.sql`${whereClause} and mm."cgu_version" = '${Prisma.raw(`${CGU_AAP_VERSION}`)}' `;
  }

  if (restrictedToOrganismsIds?.length) {
    whereClause = Prisma.sql`${whereClause} and o.id::text in (${Prisma.join(
      restrictedToOrganismsIds,
    )})`;
  }

  const organismView =
    "active_organism_by_available_certification_based_on_formacode";

  const prismaSqlOrganismView = Prisma.raw(organismView);

  const organisms: Organism[] = await prismaClient.$queryRaw`
      SELECT DISTINCT o.id,
                 o.label,
                 o.nom_public as "nomPublic",
                 o.email_contact as "emailContact",
                 o.telephone as telephone,
                 o.site_internet as "siteInternet",
                 o.adresse_numero_et_nom_de_rue as "adresseNumeroEtNomDeRue",
                 o.adresse_code_postal as "adresseCodePostal",
                 o.adresse_ville as "adresseVille",
                 o.adresse_informations_complementaires as "adresseInformationsComplementaires",
                 o.legal_status as "labelStatus",
                 o.contact_administrative_email as "contactAdministrativeEmail",
                 o.contact_administrative_phone as "contactAdministrativePhone",
                 o.website,
                 o.siret,
                 o.modalite_accompagnement as "modaliteAccompagnement",
                 o.modalite_accompagnement_renseignee_et_valide as "modaliteAccompagnementRenseigneeEtValide",
                 o.maison_mere_aap_id as "maisonMereAAPId",
                 o.ferme_pour_absence_ou_conges as "fermePourAbsenceOuConges",
                 o.conforme_norme_accessibilite as "conformeNormesAccessibilite",
                 ao.organism_id as "organismId",
                  (earth_distance(ll_to_earth(${latitude}, ${longitude}), o.ll_to_earth::earth) / 1000) AS "distanceKm"
      FROM organism o
       JOIN maison_mere_aap mm ON mm.id = o.maison_mere_aap_id
               JOIN ${prismaSqlOrganismView} ao on ao.organism_id = o.id
          ${whereClause}
      ORDER BY "distanceKm" ASC
      LIMIT ${limit}
  `;

  const count = Number(
    (
      await prismaClient.$queryRaw<{ count: number }[]>`
        SELECT count(DISTINCT o.id)
        FROM organism o
        JOIN maison_mere_aap mm ON mm.id = o.maison_mere_aap_id
        JOIN ${prismaSqlOrganismView} ao on ao.organism_id=o.id
        ${whereClause}
`
    )[0].count,
  );

  return { rows: organisms || [], totalRows: count };
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
    case "97150":
      return "SAINTE_LUCIE_SAINT_MARTIN";
    case "972":
      return "MARTINIQUE";
    case "973":
      return "GUYANE";
    case "974":
      return "LA_REUNION";
    case "975":
      return "SAINT_PIERRE_ET_MIQUELON";
    case "976":
      return "MAYOTTE";
    case "977":
      return "SAINT_BARTHELEMY";
    default:
      return "FRANCE_METROPOLITAINE";
  }
};
