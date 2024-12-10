import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMemo } from "react";

const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForAdminCertificationsPage($id: ID!) {
    certification_authority_getCertificationAuthority(id: $id) {
      id
      label
      certificationAuthorityStructures {
        id
        label
        certifications {
          id
        }
      }
      certifications {
        id
        codeRncp
        label
      }
    }
    searchCertificationsV2ForAdmin(limit: 500, offset: 0) {
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
  const queryClient = useQueryClient();

  const { data: getCertificationAuthorityAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: [
        certificationAuthorityId,
        "getCertificationAuthorityWithCertifications",
      ],
      queryFn: () =>
        graphqlClient.request(getCertificationAuthorityAndCertificationsQuery, {
          id: certificationAuthorityId,
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

  const certifications = useMemo(
    () =>
      getCertificationAuthorityAndCertificationsResponse?.searchCertificationsV2ForAdmin?.rows
        .map((c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}`,
          selected:
            certificationAuthority?.certifications.some(
              (cert) => cert.id === c.id,
            ) || false,
        }))
        .sort((c) =>
          certificationAuthority?.certificationAuthorityStructures?.some(
            (cas) => cas?.certifications.some((ca) => ca.id === c.id),
          )
            ? -1
            : 1,
        ),
    [
      certificationAuthority?.certificationAuthorityStructures,
      certificationAuthority?.certifications,
      getCertificationAuthorityAndCertificationsResponse
        ?.searchCertificationsV2ForAdmin?.rows,
    ],
  );

  return {
    certificationAuthority,
    certifications,
    updateCertificationAuthorityCertifications,
  };
};
