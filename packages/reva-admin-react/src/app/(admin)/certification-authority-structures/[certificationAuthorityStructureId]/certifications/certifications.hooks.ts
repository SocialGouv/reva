import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityStructureAndCertificationsQuery = graphql(`
  query getCertificationAuthorityStructureForAdminCertificationsPage(
    $certificationAuthorityStructureId: ID!
    $certificationsLimit: Int!
    $certificationsOffset: Int!
    $certificationsSearchFilter: String
    $certificationAuthorityStructureIdFilter: ID
  ) {
    certification_authority_getCertificationAuthorityStructure(
      id: $certificationAuthorityStructureId
    ) {
      id
      label
      certifications {
        id
      }
    }
    searchCertificationsForAdmin(
      limit: $certificationsLimit
      offset: $certificationsOffset
      searchText: $certificationsSearchFilter
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

const updateCertificationAuthorityStructureCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityStructureForAdminCertificationsPage(
    $certificationAuthorityStructureId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityStructureCertifications(
      certificationAuthorityStructureId: $certificationAuthorityStructureId
      certificationIds: $certificationIds
    ) {
      id
    }
  }
`);

export const useCertificationsPage = ({
  certificationAuthorityStructureId,
  page,
  onlyShowAddedCertifications,
  searchFilter,
}: {
  certificationAuthorityStructureId: string;
  page: number;
  onlyShowAddedCertifications: boolean;
  searchFilter?: string | null;
}) => {
  const RECORDS_PER_PAGE = 10;
  const certificationsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCertificationAuthorityStructureAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: [
        certificationAuthorityStructureId,
        page,
        onlyShowAddedCertifications,
        searchFilter,
        "getCertificationAuthorityStructureWithCertifications",
      ],
      queryFn: () =>
        graphqlClient.request(
          getCertificationAuthorityStructureAndCertificationsQuery,
          {
            certificationAuthorityStructureId,
            certificationsOffset,
            certificationsLimit: RECORDS_PER_PAGE,
            certificationsSearchFilter: searchFilter,
            certificationAuthorityStructureIdFilter: onlyShowAddedCertifications
              ? certificationAuthorityStructureId
              : undefined,
          },
        ),
    });

  const updateCertificationAuthorityStructureCertifications = useMutation({
    mutationFn: ({
      certificationAuthorityStructureId,
      certificationIds,
    }: {
      certificationAuthorityStructureId: string;
      certificationIds: string[];
    }) =>
      graphqlClient.request(
        updateCertificationAuthorityStructureCertificationsMutation,
        {
          certificationAuthorityStructureId,
          certificationIds,
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityStructureId],
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureAndCertificationsResponse?.certification_authority_getCertificationAuthorityStructure;

  const certificationPage =
    getCertificationAuthorityStructureAndCertificationsResponse?.searchCertificationsForAdmin;

  return {
    certificationAuthorityStructure,
    certificationPage,
    updateCertificationAuthorityStructureCertifications,
  };
};
