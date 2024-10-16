import { deburr } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification } from "../referential.types";
import { getFeatureByKey } from "../../feature-flipping/feature-flipping.features";

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

  let certificationView = organismId
    ? "active_organism_by_available_certification"
    : "available_certification";

  if (await isFormacodeFeatureActive()) {
    certificationView = `${certificationView}_based_on_formacode`;
  }

  const queryParams = [];

  const getCurrentQueryParamName = () => `$${queryParams.length}`;
  let commonQuery = "";

  if (organismId) {
    let organismQuery = `from certification c, ${certificationView} available_certification
      where c.id=available_certification.certification_id and status='AVAILABLE'`;

    queryParams.push(organismId);
    organismQuery += ` and available_certification.organism_id=uuid(${getCurrentQueryParamName()})`;

    if (searchTextInTsQueryFormat) {
      queryParams.push(searchTextInTsQueryFormat);
      organismQuery += ` and certification_searchable_text@@to_tsquery('simple',unaccent(${getCurrentQueryParamName()}))`;
    }
    commonQuery = organismQuery;
  } else {
    let allCertificationsQuery = `
      from certification c
      where c.status='AVAILABLE'`;

    if (searchTextInTsQueryFormat) {
      queryParams.push(searchTextInTsQueryFormat);
      allCertificationsQuery += ` and searchable_text@@to_tsquery('simple',unaccent(${getCurrentQueryParamName()}))`;
    }
    commonQuery = allCertificationsQuery;
  }

  queryParams.push(realOffset);
  const offsetParamName = getCurrentQueryParamName();
  queryParams.push(realLimit);
  const limitParamName = getCurrentQueryParamName();

  const certifications = (await prismaClient.$queryRawUnsafe(
    `select distinct(c.id),c.label,c.summary,c.status, c.rncp_id as "codeRncp", c.available_at as "availableAt", c.expires_at as "expiresAt", c.type_diplome_id as "typeDiplomeId"
      ${commonQuery}
      order by c.label offset ${offsetParamName} limit ${limitParamName}`,
    ...queryParams,
  )) as Certification[];

  const certificationCount = Number(
    (
      (await prismaClient.$queryRawUnsafe(
        `select count(distinct(c.id))
      ${commonQuery}
      `,
        ...queryParams,
      )) as { count: bigint }[]
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

const isFormacodeFeatureActive = async (): Promise<boolean> => {
  const isAapSettingsV3Active = (await getFeatureByKey("AAP_SETTINGS_V3"))
    ?.isActive;
  const isAapSettingsFormacodeActive = (
    await getFeatureByKey("AAP_SETTINGS_FORMACODE")
  )?.isActive;

  return !!(isAapSettingsV3Active && isAapSettingsFormacodeActive);
};
