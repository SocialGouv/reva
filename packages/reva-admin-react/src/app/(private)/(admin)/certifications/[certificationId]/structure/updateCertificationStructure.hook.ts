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

  const availableStructures =
    getCertificationStructureAndGestionnairesResponse
      ?.certification_authority_getCertificationAuthorityStructures.rows || [];

  return {
    getCertificationStructureAndGestionnairesQueryStatus,
    certification,
    availableStructures,
    updateCertificationStructure,
  };
};
