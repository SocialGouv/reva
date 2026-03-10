import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccount = graphql(`
  query getCertificationAuthorityLocalAccountForCertificationsLocalAccountPage(
    $certificationsOffset: Int!
    $certificationsLimit: Int!
    $certificationsSearchFilter: String
  ) {
    account_getAccountForConnectedUser {
      certificationAuthorityLocalAccount {
        certificationAuthority {
          certificationAuthorityStructures {
            id
          }
        }
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

export const useCertificationsLocalAccountPage = ({
  page,
  searchFilter,
}: {
  page: number;
  searchFilter: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { data } = useQuery({
    queryKey: [page, searchFilter, "CertificationsLocalAccountPage"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccount, {
        certificationsOffset,
        certificationsLimit: RECORDS_PER_PAGE,
        certificationsSearchFilter: searchFilter,
      }),
  });

  const certificationAuthorityLocalAccount =
    data?.account_getAccountForConnectedUser
      ?.certificationAuthorityLocalAccount;

  const certificationsPage =
    data?.account_getAccountForConnectedUser?.certificationAuthorityLocalAccount
      ?.paginatedCertifications;

  return {
    certificationAuthorityLocalAccount,
    certificationsPage,
  };
};
