import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
    $certificationsOffset: Int!
    $certificationsLimit: Int!
    $certificationsSearchFilter: String
    $certificationAuthorityLocalAccountIdFilter: ID
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
      }
      certifications {
        id
      }
      certificationAuthority {
        certificationAuthorityStructures {
          id
        }
        paginatedCertifications(
          limit: $certificationsLimit
          offset: $certificationsOffset
          searchText: $certificationsSearchFilter
          localAccountId: $certificationAuthorityLocalAccountIdFilter
        ) {
          rows {
            id
            label
            codeRncp
            visible
            certificationAuthorityStructure {
              id
            }
          }
          info {
            totalRows
            totalPages
          }
        }
      }
    }
  }
`);

const updateCertificationAuthorityLocalAccountCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityLocalAccountCertificationsForUpdateLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityLocalAccountCertifications(
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
      certificationIds: $certificationIds
    ) {
      id
      certifications {
        id
        label
        codeRncp
      }
    }
  }
`);

export const useUpdateLocalAccountCertificationsPage = ({
  certificationAuthorityLocalAccountId,
  certificationsSearchFilter,
  onlyShowAddedCertifications,
  page,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationsSearchFilter: string;
  onlyShowAddedCertifications: boolean;
  page: number;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;
  const certificationsLimit = RECORDS_PER_PAGE;

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      certificationsOffset,
      certificationsLimit,
      certificationsSearchFilter,
      onlyShowAddedCertifications,
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
        certificationsOffset,
        certificationsLimit,
        certificationsSearchFilter,
        certificationAuthorityLocalAccountIdFilter: onlyShowAddedCertifications
          ? certificationAuthorityLocalAccountId
          : undefined,
      }),
  });

  const updateCertificationAuthorityLocalAccountCertifications = useMutation({
    mutationFn: (certificationIds: string[]) =>
      graphqlClient.request(
        updateCertificationAuthorityLocalAccountCertificationsMutation,
        {
          certificationAuthorityLocalAccountId,
          certificationIds,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityLocalAccountId],
      });
    },
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  // const certificationsFromCertificationAuthority =
  //   data?.certification_authority_getCertificationAuthorityLocalAccount
  //     ?.certificationAuthority.certifications || [];

  const certificationsPage =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certificationAuthority.paginatedCertifications;

  const certificationsFromLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certifications || [];

  return {
    certificationAuthorityLocalAccount,
    certificationsPage,
    certificationsFromLocalAccount,
    isLoading,
    updateCertificationAuthorityLocalAccountCertifications,
  };
};
