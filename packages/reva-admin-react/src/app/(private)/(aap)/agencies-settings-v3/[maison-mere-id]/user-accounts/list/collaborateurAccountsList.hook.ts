import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CollaborateurAccountsListQuery = graphql(`
  query getCollaborateurAccountsList(
    $searchFilter: String!
    $offset: Int!
    $limit: Int!
  ) {
    account_getAccountForConnectedUser {
      id
      maisonMereAAP {
        id
        paginatedComptesCollaborateurs(
          offset: $offset
          limit: $limit
          searchFilter: $searchFilter
        ) {
          rows {
            id
            email
            firstname
            lastname
            disabledAt
            agences {
              id
            }
          }
          info {
            totalPages
            totalRows
            currentPage
            pageLength
          }
        }
      }
    }
  }
`);

export const useCollaborateurAccountsList = ({
  searchFilter,
  page = 1,
}: {
  searchFilter?: string;
  page: number;
}) => {
  const RECORDS_PER_PAGE = 10;
  const offset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();
  const {
    data: collaborateurAccountsListResponse,
    status: collaborateurAccountsListStatus,
  } = useQuery({
    queryKey: ["collaborateurAccountsList", searchFilter, page],
    queryFn: () =>
      graphqlClient.request(CollaborateurAccountsListQuery, {
        searchFilter: searchFilter ?? "",
        offset,
        limit: RECORDS_PER_PAGE,
      }),
  });

  const maisonMereAAPId =
    collaborateurAccountsListResponse?.account_getAccountForConnectedUser
      ?.maisonMereAAP?.id;

  const comptesCollaborateursPage =
    collaborateurAccountsListResponse?.account_getAccountForConnectedUser
      ?.maisonMereAAP?.paginatedComptesCollaborateurs;

  return {
    collaborateurAccountsListStatus,
    comptesCollaborateursPage,
    maisonMereAAPId,
  };
};
