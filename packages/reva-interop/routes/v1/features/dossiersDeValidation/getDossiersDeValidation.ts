import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/gql.js";
import { DossierDeValidationCategoryFilter } from "../../../../graphql/generated/graphql.js";

const getDossiersDeValidationQuery = graphql(`
  query getDossiersDeValidation(
    $searchFilter: String
    $categoryFilter: DossierDeValidationCategoryFilter
    $offset: Int
    $limit: Int
  ) {
    dossierDeValidation_getDossiersDeValidation(
      searchFilter: $searchFilter
      categoryFilter: $categoryFilter
      offset: $offset
      limit: $limit
    ) {
      rows {
        candidacy {
          id
        }
        dossierDeValidationSentAt
        decision
        dossierDeValidationFile {
          name
          mimeType
          previewUrl
        }
        dossierDeValidationOtherFiles {
          name
          mimeType
          previewUrl
        }
      }
      info {
        currentPage
        totalPages
        totalRows
      }
    }
  }
`);

const statusMap: Record<string, DossierDeValidationCategoryFilter> = {
  EN_ATTENTE: "PENDING",
  SIGNALE: "INCOMPLETE",
  VERIFIE: "COMPLETE",
};

export const getDossiersDeValidation = async (
  graphqlClient: Client,
  offset: number,
  limit: number,
  categoryFilter?: string,
  searchFilter?: string,
) => {
  const filter = categoryFilter ? statusMap[categoryFilter] : undefined;
  const r = await graphqlClient.query(getDossiersDeValidationQuery, {
    categoryFilter: filter,
    searchFilter: searchFilter,
    offset: offset,
    limit: limit,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.dossierDeValidation_getDossiersDeValidation;
};
