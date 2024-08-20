import { useMutation, useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
const getCertificationAuthorityStructureAndCertificationsQuery = graphql(`
  query getCertificationAuthorityStructureForAdminCertificationsPage($id: ID!) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
      certifications {
        id
        codeRncp
        label
      }
    }
    searchCertificationsForAdmin(limit: 500, offset: 0) {
      rows {
        id
        codeRncp
        label
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
}: {
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityStructureAndCertificationsResponse,
    status: getCertificationAuthorityStructureAndCertificationsStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityStructureId,
      "getCertificationAuthorityStructure",
      "getCertificationAuthorityStructureCertificationsPage",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureAndCertificationsQuery,
        {
          id: certificationAuthorityStructureId,
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
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureAndCertificationsResponse?.certification_authority_getCertificationAuthorityStructure;
  const allCertifications =
    getCertificationAuthorityStructureAndCertificationsResponse
      ?.searchCertificationsForAdmin?.rows || [];

  return {
    certificationAuthorityStructure,
    allCertifications,
    getCertificationAuthorityStructureAndCertificationsStatus,
    updateCertificationAuthorityStructureCertifications,
  };
};
