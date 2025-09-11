import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/gql.js";
import { JuryCategoryFilter } from "../../../../graphql/generated/graphql.js";

const getJuriesQuery = graphql(`
  query getJuries(
    $searchFilter: String
    $categoryFilter: JuryCategoryFilter
    $offset: Int
    $limit: Int
  ) {
    jury_getJuries(
      searchFilter: $searchFilter
      categoryFilter: $categoryFilter
      offset: $offset
      limit: $limit
    ) {
      rows {
        candidacy {
          id
        }
        dateOfSession
      }
      info {
        currentPage
        totalPages
        totalRows
      }
    }
  }
`);

const statusMap: Record<string, JuryCategoryFilter> = {
  PASSE: "PASSED",
  PROGRAMME: "SCHEDULED",
};

export const getJuries = async (
  graphqlClient: Client,
  offset: number,
  limit: number,
  categoryFilter?: string,
  searchFilter?: string,
) => {
  const filter = categoryFilter ? statusMap[categoryFilter] : undefined;
  const r = await graphqlClient.query(getJuriesQuery, {
    categoryFilter: filter,
    searchFilter: searchFilter,
    offset: offset,
    limit: limit,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.jury_getJuries;
};
