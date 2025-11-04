import { Organism, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import { getLastProfessionalCgu } from "./getLastProfessionalCgu";

export const searchOrganisms = async ({
  limit = 10,
  offset = 0,
  searchText,
  certificationId,
  disponiblePourVaeCollective,
}: {
  limit?: number;
  offset?: number;
  searchText?: string;
  certificationId?: string;
  disponiblePourVaeCollective?: boolean;
}) => {
  const fromClause = Prisma.raw(`from organism o
    join active_organism_by_available_certification_based_on_formacode ao on ao.organism_id = o.id
    join maison_mere_aap as mm on mm.id = o.maison_mere_aap_id`);

  let whereClause = Prisma.sql`where o.modalite_accompagnement_renseignee_et_valide`;

  if (disponiblePourVaeCollective) {
    whereClause = Prisma.sql`${whereClause} and o.disponible_pour_vae_collective = true`;
  }

  if (certificationId) {
    whereClause = Prisma.sql`${whereClause} and ao.certification_id=uuid(${certificationId})`;
  }

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
          select  o.id,
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
                 o.conforme_norme_accessibilite as "conformeNormesAccessibilite"
            ${fromClause}
            ${whereClause}
          order by o.nom_public, o.label limit ${limit} offset ${offset}`;

  const count = Number(
    (
      await prismaClient.$queryRaw<{ count: number }[]>`
          select count( (o.id))
            ${fromClause}
            ${whereClause}`
    )[0].count,
  );

  const paginationInfo = processPaginationInfo({
    totalRows: count,
    limit,
    offset,
  });

  return {
    info: paginationInfo,
    rows: results,
  };
};
