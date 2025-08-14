import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CandidacyStatusFilter } from "@/graphql/generated/graphql";

const getCohortesQuery = graphql(`
  query getCohortesForVaeCollectivesPage {
    cohortesVaeCollectivesForConnectedAap {
      id
      nom
    }
  }
`);

const getCandidaciesQuery = graphql(`
  query getCandidaciesForVaeCollectivesPage(
    $cohorteId: ID!
    $status: CandidacyStatusFilter
    $limit: Int!
    $offset: Int!
    $searchFilter: String!
  ) {
    getCandidacies(
      cohorteVaeCollectiveId: $cohorteId
      statusFilter: $status
      limit: $limit
      offset: $offset
      searchFilter: $searchFilter
    ) {
      rows {
        id
        candidate {
          firstname
          lastname
          givenName
          department {
            label
            code
          }
        }
        certification {
          label
          codeRncp
        }
        organism {
          label
          nomPublic
          modaliteAccompagnement
        }
        financeModule
        candidacyStatuses {
          status
          createdAt
        }
        status
        feasibility {
          dematerializedFeasibilityFile {
            sentToCandidateAt
            isReadyToBeSentToCertificationAuthority
            isReadyToBeSentToCandidate
            candidateConfirmationAt
            swornStatementFileId
          }
          decision
          feasibilityFileSentAt
        }
        candidacyDropOut {
          createdAt
        }
        jury {
          dateOfSession
          result
        }
        cohorteVaeCollective {
          nom
          nom
          commanditaireVaeCollective {
            raisonSociale
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

export const useVAECollectivesPage = ({
  cohorteId,
  status,
  page = 1,
  searchFilter = "",
}: {
  cohorteId?: string | null;
  status?: CandidacyStatusFilter | null;
  page?: number;
  searchFilter?: string;
}) => {
  const RECORDS_PER_PAGE = 10;
  const offset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();

  const { data: getCohortesResponse } = useQuery({
    queryKey: ["getCohortesForVaeCollectivesPage"],
    queryFn: () => graphqlClient.request(getCohortesQuery),
  });

  const { data: getCandidaciesResponse } = useQuery({
    queryKey: [
      cohorteId,
      status,
      page,
      searchFilter,
      "getCandidaciesForVaeCollectivesPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidaciesQuery, {
        cohorteId: cohorteId ?? "",
        status: status ?? "ACTIVE_HORS_ABANDON",
        offset,
        limit: RECORDS_PER_PAGE,
        searchFilter,
      }),
    enabled: !!cohorteId && !!status,
  });

  const cohortes = getCohortesResponse?.cohortesVaeCollectivesForConnectedAap;
  const candidacies = getCandidaciesResponse?.getCandidacies;

  return {
    cohortes,
    candidacies,
  };
};
