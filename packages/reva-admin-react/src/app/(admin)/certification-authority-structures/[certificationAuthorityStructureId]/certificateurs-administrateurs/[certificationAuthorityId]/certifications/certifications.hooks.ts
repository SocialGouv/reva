import { useMutation, useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForAdminCertificationsPage($id: ID!) {
    certification_authority_getCertificationAuthority(id: $id) {
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
}: {
  certificationAuthorityId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityAndCertificationsResponse,
    status: getCertificationAuthorityAndCertificationsStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityId,
      "getCertificationAuthority",
      "getCertificationAuthorityCertificationsPage",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityAndCertificationsQuery,
        {
          id: certificationAuthorityId,
        },
      ),
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
  });

  const certificationAuthority =
    getCertificationAuthorityAndCertificationsResponse?.certification_authority_getCertificationAuthority;
  const allCertifications =
    getCertificationAuthorityAndCertificationsResponse
      ?.searchCertificationsForAdmin?.rows || [];

  return {
    certificationAuthority,
    allCertifications,
    getCertificationAuthorityAndCertificationsStatus,
    updateCertificationAuthorityCertifications,
  };
};
