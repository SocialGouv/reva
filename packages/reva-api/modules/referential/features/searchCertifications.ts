import { deburr } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification } from "../referential.types";

export const searchCertifications = async ({
  offset,
  limit,
  departmentId,
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
    ? "active_organism_by_available_certification_and_department"
    : "available_certification_by_department";

  const commonQuery = `
      from certification c, ${certificationView} available_certification
      where c.id=available_certification.certification_id
      ${
        departmentId
          ? `and available_certification.department_id=uuid('${departmentId}')`
          : ""
      }
      ${
        organismId
          ? `and available_certification.organism_id=uuid('${organismId}')`
          : ""
      }
      ${
        searchTextInTsQueryFormat
          ? `and certification_searchable_text@@to_tsquery('simple',unaccent('${searchTextInTsQueryFormat}'))`
          : ""
      }`;

  const certifications =
    (await prismaClient.$queryRawUnsafe(`select distinct(c.id),c.label,c.summary,c.status, c.rncp_id as "codeRncp"
      ${commonQuery}
      order by c.label offset ${realOffset} limit ${realLimit}`)) as Certification[];

  const certificationCount = Number(
    (
      (await prismaClient.$queryRawUnsafe(`select count(distinct(c.id))
      ${commonQuery}
      `)) as { count: BigInt }[]
    )[0].count
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
