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
        certificationsAndParcours(
          limit: $certificationsLimit
          offset: $certificationsOffset
          searchText: $certificationsSearchFilter
        ) {
          rows {
            certification {
              certificationAuthorityStructure {
                id
              }
              id
              codeRncp
              label
              visible
              parcours(limit: 1) {
                rows {
                  id
                }
              }
            }
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

  const certificationAndParcoursPage =
    getCertificationAuthorityAndCertificationsResponse
      ?.account_getAccountForConnectedUser?.certificationAuthority
      ?.certificationsAndParcours;

  return {
    certificationAuthority,
    certificationAndParcoursPage,
  };
};
