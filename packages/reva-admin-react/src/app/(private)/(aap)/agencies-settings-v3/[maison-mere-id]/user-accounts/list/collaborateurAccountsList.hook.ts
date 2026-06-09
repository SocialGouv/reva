import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CollaborateurAccountsListQuery = graphql(`
  query getCollaborateurAccountsList(
    $maisonMereAAPId: ID!
    $searchFilter: String!
    $offset: Int!
    $limit: Int!
  ) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
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

  const maisonMereAAPIdParam = useParams<{ "maison-mere-id": string }>()[
    "maison-mere-id"
  ];

  const { graphqlClient } = useGraphQlClient();
  const {
    data: collaborateurAccountsListResponse,
    status: collaborateurAccountsListStatus,
  } = useQuery({
    queryKey: ["collaborateurAccountsList", searchFilter, page],
    queryFn: () =>
      graphqlClient.request(CollaborateurAccountsListQuery, {
        maisonMereAAPId: maisonMereAAPIdParam,
        searchFilter: searchFilter ?? "",
        offset,
        limit: RECORDS_PER_PAGE,
      }),
  });

  const maisonMereAAPId =
    collaborateurAccountsListResponse?.organism_getMaisonMereAAPById?.id;

  const comptesCollaborateursPage =
    collaborateurAccountsListResponse?.organism_getMaisonMereAAPById
      ?.paginatedComptesCollaborateurs;

  return {
    collaborateurAccountsListStatus,
    comptesCollaborateursPage,
    maisonMereAAPId,
  };
};
