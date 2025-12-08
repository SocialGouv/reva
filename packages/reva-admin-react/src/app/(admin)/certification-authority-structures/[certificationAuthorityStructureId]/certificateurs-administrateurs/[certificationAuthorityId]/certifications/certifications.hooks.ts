import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForAdminCertificationsPage(
    $id: ID!
    $certificationsOffset: Int!
    $certificationsLimit: Int!
    $certificationsSearchFilter: String
    $certificationAuthorityIdFilter: ID
  ) {
    certification_authority_getCertificationAuthority(id: $id) {
      id
      label
      certificationAuthorityStructures {
        id
        label
      }
      certifications {
        id
        codeRncp
        label
      }
    }
    searchCertificationsForAdmin(
      limit: $certificationsLimit
      offset: $certificationsOffset
      searchText: $certificationsSearchFilter
      certificationAuthorityIdFilter: $certificationAuthorityIdFilter
    ) {
      rows {
        id
        codeRncp
        label
      }
      info {
        totalRows
        totalPages
      }
    }
  }
`);

const updateCertificationAuthorityCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityForAdminCertificationsPage(
    $certificationAuthorityId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityCertifications(
      certificationAuthorityId: $certificationAuthorityId
      certificationIds: $certificationIds
    ) {
      id
    }
  }
`);

export const useCertificationsPage = ({
  certificationAuthorityId,
  page,
  onlyShowAddedCertifications,
  searchFilter,
}: {
  certificationAuthorityId: string;
  page: number;
  onlyShowAddedCertifications: boolean;
  searchFilter?: string | null;
}) => {
  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCertificationAuthorityAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: [
        certificationAuthorityId,
        "getCertificationAuthorityWithCertifications",
        page,
        onlyShowAddedCertifications,
        searchFilter,
      ],
      queryFn: () =>
        graphqlClient.request(getCertificationAuthorityAndCertificationsQuery, {
          id: certificationAuthorityId,
          certificationsOffset,
          certificationsLimit: RECORDS_PER_PAGE,
          certificationsSearchFilter: searchFilter,
          certificationAuthorityIdFilter: onlyShowAddedCertifications
            ? certificationAuthorityId
            : undefined,
        }),
    });

  const updateCertificationAuthorityCertifications = useMutation({
    mutationFn: ({
      certificationAuthorityId,
      certificationIds,
    }: {
      certificationAuthorityId: string;
      certificationIds: string[];
    }) =>
      graphqlClient.request(
        updateCertificationAuthorityCertificationsMutation,
        {
          certificationAuthorityId,
          certificationIds,
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityId],
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityAndCertificationsResponse?.certification_authority_getCertificationAuthority;

  const certificationPage =
    getCertificationAuthorityAndCertificationsResponse?.searchCertificationsForAdmin;

  return {
    certificationAuthority,
    certificationPage,
    updateCertificationAuthorityCertifications,
  };
};
