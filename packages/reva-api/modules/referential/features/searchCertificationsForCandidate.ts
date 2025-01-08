import { deburr } from "lodash";

import { Prisma } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification } from "../referential.types";

export const searchCertificationsForCandidate = async ({
  offset,
  limit,
  organismId,
  searchText,
}: {
  offset?: number;
  limit?: number;
  departmentId?: string;
  organismId?: string;
  searchText?: string;
}): Promise<PaginatedListResult<Certification>> => {
  const realLimit = limit || 10;
  const realOffset = offset || 0;

  const searchTextInTsQueryFormat = deburr(searchText)
    ?.replace(/[^A-Z0-9]/gi, " ")
    ?.split(" ")
    .filter((t) => t)
    .map((t) => t + ":*")
    .join("&");

  const organismQuery = Prisma.sql`${Prisma.raw(`from certification c, active_organism_by_available_certification_based_on_formacode available_certification
    where c.id=available_certification.certification_id`)} 
      ${Prisma.sql` and available_certification.organism_id=uuid(${organismId})`}
      ${
        searchTextInTsQueryFormat
          ? Prisma.sql` and certification_searchable_text@@to_tsquery('simple',unaccent(${searchTextInTsQueryFormat}))`
          : Prisma.empty
      }`;

  const allCertificationsQuery = Prisma.sql`
      from certification c
      where c.visible=true
      ${
        searchTextInTsQueryFormat
          ? Prisma.sql` and searchable_text@@to_tsquery('simple',unaccent(${searchTextInTsQueryFormat}))`
          : Prisma.empty
      }`;

  const commonQuery = organismId ? organismQuery : allCertificationsQuery;

  const certifications =
    (await prismaClient.$queryRaw`select distinct(c.id),c.label,c.summary,c.status, c.rncp_id as "codeRncp", c.available_at as "availableAt", c.expires_at as "expiresAt"
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
