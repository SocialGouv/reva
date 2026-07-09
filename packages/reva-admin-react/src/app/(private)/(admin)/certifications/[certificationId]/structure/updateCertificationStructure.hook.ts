import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationStructureAndGestionnairesQuery = graphql(`
  query getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      certificationAuthorityStructure {
        id
        label
      }
      certificationAuthorities {
        id
      }
    }
    certification_authority_getCertificationAuthorityStructures(limit: 500) {
      rows {
        id
        label
      }
    }
  }
`);

const getFCCertificateursQuery = graphql(`
  query getFCCertificateursForUpdateCertificationStructurePage($rncp: ID!) {
    getFCCertification(rncp: $rncp) {
      CERTIFICATEURS {
        NOM_CERTIFICATEUR
      }
    }
  }
`);

const updateCertificationStructureAndCertificationAuthoritiesMutation = graphql(
  `
    mutation updateCertificationStructureForUpdateCertificationStructurePage(
      $input: UpdateCertificationStructureAndCertificationAuthoritiesInput!
    ) {
      referential_updateCertificationStructureAndCertificationAuthorities(
        input: $input
      ) {
        id
      }
    }
  `,
);

export const useUpdateCertificationStructurePage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCertificationStructureAndGestionnairesResponse,
    status: getCertificationStructureAndGestionnairesQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "structure",
      "getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationStructureAndGestionnairesQuery, {
        certificationId,
      }),
  });

  const updateCertificationStructure = useMutation({
    mutationFn: ({
      certificationAuthorityStructureId,
      certificationAuthorityIds,
    }: {
      certificationAuthorityStructureId: string;
      certificationAuthorityIds: string[];
    }) =>
      graphqlClient.request(
        updateCertificationStructureAndCertificationAuthoritiesMutation,
        {
          input: {
            certificationId,
            certificationAuthorityStructureId,
            certificationAuthorityIds,
          },
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationId],
      }),
  });

  const certification =
    getCertificationStructureAndGestionnairesResponse?.getCertification;

  const codeRncp = certification?.codeRncp;

  const { data: getFCCertificateursResponse } = useQuery({
    queryKey: [
      codeRncp,
      "structure",
      "getFCCertificateursForUpdateCertificationStructurePage",
    ],
    queryFn: () =>
      graphqlClient.request(getFCCertificateursQuery, {
        rncp: codeRncp as string,
      }),
    enabled: !!codeRncp,
  });

  const availableStructures =
    getCertificationStructureAndGestionnairesResponse
      ?.certification_authority_getCertificationAuthorityStructures.rows || [];

  const fcCertificateurs =
    getFCCertificateursResponse?.getFCCertification?.CERTIFICATEURS || [];

  return {
    getCertificationStructureAndGestionnairesQueryStatus,
    certification,
    availableStructures,
    fcCertificateurs,
    updateCertificationStructure,
  };
};
