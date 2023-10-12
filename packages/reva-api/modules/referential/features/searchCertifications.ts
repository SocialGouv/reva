import { deburr } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification } from "../referential.types";

export const searchCertifications = async ({
  offset,
  limit,
  departmentId,
  searchText,
}: {
  offset?: number;
  limit?: number;
  departmentId?: string;
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

  const certifications =
    (await prismaClient.$queryRawUnsafe(`select distinct(c.id),c.label,c.summary,c.status, c.rncp_id as "codeRncp"
      from certification c, available_certification_by_department where c.id=available_certification_by_department.certification_id ${
        departmentId
          ? `and available_certification_by_department.department_id=uuid('${departmentId}')`
          : ""
      } ${
      searchTextInTsQueryFormat
        ? `and certification_searchable_text@@to_tsquery('french',unaccent('${searchTextInTsQueryFormat}'))`
        : ""
    } order by c.label offset ${realOffset} limit ${realLimit}`)) as Certification[];

  const certificationCount = Number(
    (
      (await prismaClient.$queryRawUnsafe(`select count(distinct(c.id))
      from certification c, available_certification_by_department where c.id=available_certification_by_department.certification_id ${
        departmentId
          ? `and available_certification_by_department.department_id=uuid('${departmentId}')`
          : ""
      } ${
        searchTextInTsQueryFormat
          ? `and certification_searchable_text@@to_tsquery('french',unaccent('${searchTextInTsQueryFormat}'))`
          : ""
      }`)) as { count: BigInt }[]
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
