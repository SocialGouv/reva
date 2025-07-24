import { FromSchema } from "json-schema-to-ts";

import { pageInfoSchema } from "../../routes/v1/responseSchemas.js";

type MappedPageInfo = FromSchema<typeof pageInfoSchema>;

export const mapPageInfo = (pageInfo: {
  totalRows: number;
  currentPage: number;
  totalPages: number;
}): MappedPageInfo => {
  return {
    totalElements: pageInfo.totalRows,
    totalPages: pageInfo.totalPages,
    pageCourante: pageInfo.currentPage,
  };
};
