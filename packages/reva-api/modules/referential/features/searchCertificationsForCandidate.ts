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
}: {
  offset?: number;
  limit?: number;
  organismId?: string;
  searchText?: string;
  candidacyId?: string;
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
      }`;

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
      }`;

  const commonQuery = organismId ? organismQuery : allCertificationsQuery;

  const certifications =
    (await prismaClient.$queryRaw`select distinct(c.id),c.label,c.summary,c.status, c.rncp_id as "codeRncp", c.available_at as "availableAt", c.rncp_expires_at as "rncpExpiresAt"
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
