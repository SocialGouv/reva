import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    }
    certification_authority_getCertificationAuthorityStructures(limit: 100) {
      rows {
        id
        label
      }
    }
  }
`);

const updateCertificationStructureMutation = graphql(`
  mutation updateCertificationStructureForUpdateCertificationStructurePage(
    $input: UpdateCertificationStructureInput!
  ) {
    referential_updateCertificationStructure(input: $input) {
      id
    }
  }
`);

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
    }: {
      certificationAuthorityStructureId: string;
    }) =>
      graphqlClient.request(updateCertificationStructureMutation, {
        input: { certificationId, certificationAuthorityStructureId },
      }),
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
