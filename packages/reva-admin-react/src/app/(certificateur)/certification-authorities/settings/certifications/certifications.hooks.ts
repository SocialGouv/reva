import { useSuspenseQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForCertificationsPage(
    $certificationsOffset: Int!
    $certificationsLimit: Int!
    $certificationsSearchFilter: String
  ) {
    account_getAccountForConnectedUser {
      certificationAuthority {
        certificationAuthorityStructures {
          id
        }
        id
        label
        paginatedCertifications(
          limit: $certificationsLimit
          offset: $certificationsOffset
          searchText: $certificationsSearchFilter
        ) {
          rows {
            certificationAuthorityStructure {
              id
            }
            id
            codeRncp
            label
            visible
          }
          info {
            totalRows
            totalPages
            currentPage
          }
        }
      }
    }
  }
`);

export const useCertificationsPage = ({
  page,
  searchFilter,
}: {
  page: number;
  searchFilter?: string | null;
}) => {
  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationAuthorityAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: [
        page,
        searchFilter,
        "getCertificationAuthorityForCertificationsPage",
      ],
      queryFn: () => {
        return graphqlClient.request(
          getCertificationAuthorityAndCertificationsQuery,
          {
            certificationsOffset,
            certificationsLimit: RECORDS_PER_PAGE,
            certificationsSearchFilter: searchFilter,
          },
        );
      },
    });

  const certificationAuthority =
    getCertificationAuthorityAndCertificationsResponse
      ?.account_getAccountForConnectedUser?.certificationAuthority;

  const certificationPage =
    getCertificationAuthorityAndCertificationsResponse
      ?.account_getAccountForConnectedUser?.certificationAuthority
      ?.paginatedCertifications;

  return {
    certificationAuthority,
    certificationPage,
  };
};
