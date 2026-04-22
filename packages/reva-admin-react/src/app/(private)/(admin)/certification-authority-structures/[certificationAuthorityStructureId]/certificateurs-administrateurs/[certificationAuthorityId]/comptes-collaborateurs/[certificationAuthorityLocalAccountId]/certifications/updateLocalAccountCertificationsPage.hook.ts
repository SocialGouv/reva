import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
    $certificationAuthorityStructureId: ID!
    $certificationsOffset: Int!
    $certificationsLimit: Int!
    $certificationsSearchFilter: String
    $certificationAuthorityIdFilter: ID
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
      certificationAuthority {
        id
        label
      }
      certifications {
        id
      }
    }
    searchCertificationsForAdmin(
      limit: $certificationsLimit
      offset: $certificationsOffset
      searchText: $certificationsSearchFilter
      certificationAuthorityIdFilter: $certificationAuthorityIdFilter
      certificationAuthorityLocalAccountIdFilter: $certificationAuthorityLocalAccountIdFilter
    ) {
      rows {
        id
        codeRncp
        label
        visible
      }
      info {
        totalRows
        totalPages
      }
    }
    certification_authority_getCertificationAuthorityStructure(
      id: $certificationAuthorityStructureId
    ) {
      id
      label
    }
  }
`);

const updateCertificationAuthorityLocalAccountCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityLocalAccountCertificationsForAdminUpdateLocalAccountCertificationsPage(
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
  certificationAuthorityStructureId,
  certificationAuthorityId,
  page,
  onlyShowAddedCertifications,
  searchFilter,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationAuthorityStructureId: string;
  certificationAuthorityId: string;
  page: number;
  onlyShowAddedCertifications: boolean;
  searchFilter?: string | null;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      certificationAuthorityId,
      certificationAuthorityStructureId,
      page,
      onlyShowAddedCertifications,
      searchFilter,
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountAdminCertificationsPage",
    ],

    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
        certificationAuthorityStructureId,
        certificationsOffset,
        certificationsLimit: RECORDS_PER_PAGE,
        certificationsSearchFilter: searchFilter,
        certificationAuthorityIdFilter: certificationAuthorityId,
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

  const certificationsFromLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certifications || [];

  const certificationAuthorityStructure =
    data?.certification_authority_getCertificationAuthorityStructure;

  const certificationPage = data?.searchCertificationsForAdmin;

  return {
    certificationAuthorityLocalAccount,
    certificationsFromLocalAccount,
    certificationAuthorityStructure,
    certificationPage,
    isLoading,
    updateCertificationAuthorityLocalAccountCertifications,
  };
};
