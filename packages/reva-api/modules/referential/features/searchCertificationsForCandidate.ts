import { Prisma } from "@prisma/client";
import { deburr } from "lodash";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import { Certification } from "../referential.types";

export const searchCertificationsForCandidate = async ({
  offset,
  limit,
  organismId,
  searchText,
  candidacyId,
  cohorteVaeCollectiveIdFilter,
}: {
  offset?: number;
  limit?: number;
  organismId?: string;
  searchText?: string;
  candidacyId?: string;
  cohorteVaeCollectiveIdFilter?: string;
}): Promise<PaginatedListResult<Certification>> => {
  const realLimit = limit || 10;
  const realOffset = offset || 0;

  const searchTextInTsQueryFormat = deburr(searchText)
    ?.replace(/[^A-Z0-9]/gi, " ")
    ?.split(" ")
    .filter((t) => t)
    .map((t) => t + ":*")
    .join("&");

  let certificationsFromCohorteVaeCollectiveIds: string[] = [];

  // If the candidacy is part of a VAE collective cohort, the certifications available are restricted to those defined for that cohort
  if (candidacyId) {
    const certificationCohorteVaeCollective =
      await prismaClient.certificationCohorteVaeCollective.findMany({
        where: {
          cohorteVaeCollective: { candidacy: { some: { id: candidacyId } } },
        },
      });
    certificationsFromCohorteVaeCollectiveIds =
      certificationCohorteVaeCollective.map(
        (certificationCohorteVaeCollective) =>
          certificationCohorteVaeCollective.certificationId,
      );
  }

  // If a cohorte VAE collective ID filter is provided, the certifications available are restricted to those defined for that cohorte
  // Seems like it might conflict with the candidacyId filter if the candidacy is part of a VAE collective cohort but this one is used in the vae collective app
  if (cohorteVaeCollectiveIdFilter) {
    const certificationCohorteVaeCollective =
      await prismaClient.certificationCohorteVaeCollective.findMany({
        where: {
          cohorteVaeCollectiveId: cohorteVaeCollectiveIdFilter,
        },
      });
    certificationsFromCohorteVaeCollectiveIds =
      certificationCohorteVaeCollective.map(
        (certificationCohorteVaeCollective) =>
          certificationCohorteVaeCollective.certificationId,
      );

    // if the cohorte has no certifications, we add a dummy one in the filter to force an empty result
    if (certificationsFromCohorteVaeCollectiveIds.length === 0) {
      certificationsFromCohorteVaeCollectiveIds.push(
        "00000000-0000-0000-0000-000000000000",
      );
    }
  }

  const organismQuery = Prisma.sql`${Prisma.raw(`from certification c, active_organism_by_available_certification_based_on_formacode available_certification
    where c.id=available_certification.certification_id`)}
      ${Prisma.sql` and available_certification.organism_id=uuid(${organismId})`}
      ${
        searchTextInTsQueryFormat
          ? Prisma.sql` and certification_searchable_text@@to_tsquery('simple',unaccent(${searchTextInTsQueryFormat}))`
          : Prisma.empty
      }
      ${
        certificationsFromCohorteVaeCollectiveIds.length
          ? Prisma.sql` and c.id::text in (${Prisma.join(
              certificationsFromCohorteVaeCollectiveIds,
            )})`
          : Prisma.empty
      }
      -- On inclus uniquement les certifications qui sont soit : 
      --  - Sans parcours
      --  - Avec au moins un parcours et au moins une autorité de certification associée à un parcours
      and (
        not exists (select 1 from parcours_certification pc where pc.certification_id = c.id)
        or
        exists (
          select 1
          from parcours_certification pc
          join certification_authority_on_certification_on_parcours_certification caocopc on caocopc.parcours_certification_id = pc.id
          where pc.certification_id = c.id
        )
      )`;

  const allCertificationsQuery = Prisma.sql`
      from certification c
      where c.visible=true
      ${
        searchTextInTsQueryFormat
          ? Prisma.sql` and searchable_text@@to_tsquery('simple',unaccent(${searchTextInTsQueryFormat}))`
          : Prisma.empty
      }
      ${
        certificationsFromCohorteVaeCollectiveIds.length
          ? Prisma.sql` and c.id::text in (${Prisma.join(
              certificationsFromCohorteVaeCollectiveIds,
            )})`
          : Prisma.empty
      }
      -- On inclus uniquement les certifications qui sont soit : 
      --  - Sans parcours
      --  - Avec au moins un parcours et au moins une autorité de certification associée à un parcours
      and (
        not exists (select 1 from parcours_certification pc where pc.certification_id = c.id)
        or
        exists (
          select 1
          from parcours_certification pc
          join certification_authority_on_certification_on_parcours_certification caocopc on caocopc.parcours_certification_id = pc.id
          where pc.certification_id = c.id
        )
      )`;

  const commonQuery = organismId ? organismQuery : allCertificationsQuery;

  const certifications =
    (await prismaClient.$queryRaw`select distinct(c.id),c.label,c.summary,c.status, c.rncp_id as "codeRncp", c.rncp_type_diplome as "rncpTypeDiplome", c.available_at as "availableAt", c.rncp_expires_at as "rncpExpiresAt", c.certification_authority_structure_id as "certificationAuthorityStructureId"
      ${commonQuery}
      order by c.label offset ${realOffset} limit ${realLimit}`) as Certification[];

  const certificationCount = Number(
    (
      (await prismaClient.$queryRaw`select count(distinct(c.id))
      ${commonQuery}
      `) as { count: bigint }[]
    )[0].count,
  );

  const page = {
    rows: certifications,
    info: processPaginationInfo({
      totalRows: certificationCount,
      limit: realLimit,
      offset: realOffset,
    }),
  };
  return page;
};
