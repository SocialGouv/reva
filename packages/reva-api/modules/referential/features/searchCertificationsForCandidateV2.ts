import { deburr } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification } from "../referential.types";

export const searchCertificationsForCandidateV2 = async ({
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

  const certificationView = organismId
    ? "active_organism_by_available_certification"
    : "available_certification";

  const organismQuery = `
      from certification c, ${certificationView} available_certification
      where c.id=available_certification.certification_id and status='AVAILABLE' 
      ${
        organismId
          ? ` and available_certification.organism_id=uuid('${organismId}')`
          : ""
      }
      ${
        searchTextInTsQueryFormat
          ? ` and certification_searchable_text@@to_tsquery('simple',unaccent('${searchTextInTsQueryFormat}'))`
          : ""
      }`;

  const allCertificationsQuery = `
      from certification c
      where c.status='AVAILABLE'
      ${
        searchTextInTsQueryFormat
          ? ` and searchable_text@@to_tsquery('simple',unaccent('${searchTextInTsQueryFormat}'))`
          : ""
      }`;

  const commonQuery = organismId ? organismQuery : allCertificationsQuery;

  const certifications =
    (await prismaClient.$queryRawUnsafe(`select distinct(c.id),c.label,c.summary,c.status,c.certification_authority_tag as "certificationAuthorityTag", c.rncp_id as "codeRncp", c.available_at as "availableAt", c.expires_at as "expiresAt", c.type_diplome_id as "typeDiplomeId"
      ${commonQuery}
      order by c.label offset ${realOffset} limit ${realLimit}`)) as Certification[];

  const certificationCount = Number(
    (
      (await prismaClient.$queryRawUnsafe(`select count(distinct(c.id))
      ${commonQuery}
      `)) as { count: bigint }[]
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
