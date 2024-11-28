import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMemo } from "react";

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
  const queryClient = useQueryClient();

  const { data: getCertificationAuthorityStructureAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: [
        certificationAuthorityStructureId,
        "getCertificationAuthorityStructureWithCertifications",
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
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityStructureId],
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureAndCertificationsResponse?.certification_authority_getCertificationAuthorityStructure;

  const certifications = useMemo(
    () =>
      getCertificationAuthorityStructureAndCertificationsResponse?.searchCertificationsForAdmin?.rows
        .map((c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}`,
          selected:
            certificationAuthorityStructure?.certifications.some(
              (cert) => cert.id === c.id,
            ) || false,
        }))
        .sort((a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0)),
    [
      certificationAuthorityStructure?.certifications,
      getCertificationAuthorityStructureAndCertificationsResponse
        ?.searchCertificationsForAdmin?.rows,
    ],
  );

  return {
    certificationAuthorityStructure,
    certifications,
    updateCertificationAuthorityStructureCertifications,
  };
};
