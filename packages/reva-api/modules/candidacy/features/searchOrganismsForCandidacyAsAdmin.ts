import { Prisma } from "@prisma/client";

import { getLastProfessionalCgu } from "@/modules/organism/features/getLastProfessionalCgu";
import { Organism } from "@/modules/organism/organism.types";
import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const searchOrganismsForCandidacyAsAdmin = async ({
  candidacyId,
  offset,
  limit,
  searchText,
}: {
  candidacyId: string;
  offset?: number;
  limit?: number;
  searchText?: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      candidate: { select: { departmentId: true } },
      organism: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const realLimit = limit || 10;
  const realOffset = offset || 0;

  const result = await getActiveOrganismForCertification({
    certificationId: candidacy.certificationId || "",
    searchText,
    // use limit + 1 then escape current organism
    limit: realLimit + 1,
    offset: realOffset,
  });

  // use limit + 1 then escape current organism
  const organismsFound = result.rows
    .filter((r) => r.id !== candidacy?.organism?.id)
    .slice(0, limit);

  const page = {
    rows: organismsFound,
    info: processPaginationInfo({
      totalRows: result.totalRows,
      limit: realLimit,
      offset: realOffset,
    }),
  };

  return page;
};

const getActiveOrganismForCertification = async ({
  certificationId,
  searchText,
  limit,
  offset,
}: {
  certificationId: string;
  searchText?: string;
  limit: number;
  offset: number;
}) => {
  const organismView =
    "active_organism_by_available_certification_based_on_formacode";

  const fromClause = Prisma.raw(`from organism o
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

  const CGU_AAP_VERSION = (await getLastProfessionalCgu())?.version;
  if (CGU_AAP_VERSION != undefined) {
    whereClause = Prisma.sql`${whereClause} and mm."cgu_version" = '${Prisma.raw(`${CGU_AAP_VERSION}`)}' `;
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
                 ao.organism_id as "organismId"
            ${fromClause}
            ${whereClause}
          order by o.label offset ${offset} limit ${limit}`;

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
