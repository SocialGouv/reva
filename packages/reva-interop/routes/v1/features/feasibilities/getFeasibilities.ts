import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/gql.js";
import { FeasibilityCategoryFilter } from "../../../../graphql/generated/graphql.js";

const getFeasibilitiesQuery = graphql(`
  query getFeasibilities(
    $searchFilter: String
    $categoryFilter: FeasibilityCategoryFilter
    $offset: Int
    $limit: Int
  ) {
    feasibilities(
      searchFilter: $searchFilter
      categoryFilter: $categoryFilter
      offset: $offset
      limit: $limit
    ) {
      rows {
        id
        candidacy {
          id
          status
          cohorteVaeCollective {
            id
          }
          candidacyDropOut {
            createdAt
          }
          experiences {
            title
            description
            duration
            startedAt
          }
        }
        feasibilityFileSentAt
        decision
        feasibilityFormat
        feasibilityUploadedPdf {
          feasibilityFile {
            name
            mimeType
            previewUrl
          }
          IDFile {
            name
            mimeType
            previewUrl
          }
          documentaryProofFile {
            name
            mimeType
            previewUrl
          }
          certificateOfAttendanceFile {
            name
            mimeType
            previewUrl
          }
        }
        dematerializedFeasibilityFile {
          dffFile {
            name
            mimeType
            previewUrl
          }
          attachments {
            id
            type
            file {
              name
              mimeType
              previewUrl
            }
          }
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

const statusMap: Record<string, FeasibilityCategoryFilter> = {
  EN_ATTENTE: "PENDING",
  IRRECEVABLE: "REJECTED",
  RECEVABLE: "ADMISSIBLE",
  ABANDONNE: "DROPPED_OUT",
  INCOMPLET: "INCOMPLETE",
  COMPLET: "COMPLETE",
  ARCHIVE: "ARCHIVED",
};

export const getFeasibilities = async (
  graphqlClient: Client,
  offset: number,
  limit: number,
  categoryFilter?: string,
  searchFilter?: string,
) => {
  const filter = categoryFilter ? statusMap[categoryFilter] : undefined;
  const r = await graphqlClient.query(getFeasibilitiesQuery, {
    categoryFilter: filter,
    searchFilter: searchFilter,
    offset: offset,
    limit: limit,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.feasibilities;
};
