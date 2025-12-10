import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForAdminCertificationsPage(
    $certificationAuthorityId: ID!
    $certificationsOffset: Int!
    $certificationsLimit: Int!
    $certificationsSearchFilter: String
    $certificationAuthorityIdFilter: ID
    $certificationAuthorityStructureIdFilter: ID
  ) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
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
      certificationAuthorityStructureIdFilter: $certificationAuthorityStructureIdFilter
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
  certificationAuthorityStructureId,
  certificationAuthorityId,
  page,
  onlyShowAddedCertifications,
  searchFilter,
  showAllCertifications,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityId: string;
  page: number;
  onlyShowAddedCertifications: boolean;
  searchFilter?: string | null;
  showAllCertifications?: boolean;
}) => {
  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCertificationAuthorityAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: [
        certificationAuthorityId,
        certificationAuthorityStructureId,
        page,
        onlyShowAddedCertifications,
        showAllCertifications,
        searchFilter,
        "getCertificationAuthorityWithCertifications",
      ],
      queryFn: () =>
        graphqlClient.request(getCertificationAuthorityAndCertificationsQuery, {
          certificationAuthorityId,
          certificationsOffset,
          certificationsLimit: RECORDS_PER_PAGE,
          certificationsSearchFilter: searchFilter,
          certificationAuthorityIdFilter: onlyShowAddedCertifications
            ? certificationAuthorityId
            : undefined,
          certificationAuthorityStructureIdFilter: showAllCertifications
            ? undefined
            : certificationAuthorityStructureId,
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
