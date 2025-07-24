import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityStructureQuery = graphql(`
  query getCertificationAuthorityStructureForAdminInformationsGeneralesPage(
    $id: ID!
  ) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
    }
  }
`);

const updateCertificationAuthorityStructureMutation = graphql(`
  mutation updateCertificationAuthorityStructureForAdminInformationsGeneralesPage(
    $certificationAuthorityStructureId: ID!
    $certificationAuthorityStructureLabel: String!
  ) {
    certification_authority_updateCertificationAuthorityStructure(
      certificationAuthorityStructureId: $certificationAuthorityStructureId
      certificationAuthorityStructureLabel: $certificationAuthorityStructureLabel
    ) {
      id
      label
    }
  }
`);

export const useInformationGeneralesPage = ({
  certificationAuthorityStructureId,
}: {
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityStructureResponse,
    status: getCertificationAuthorityStructureStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityStructureId,
      "getCertificationAuthorityStructure",
      "getCertificationAuthorityStructureInformationsGeneralesPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructureQuery, {
        id: certificationAuthorityStructureId,
      }),
  });

  const updateCertificationAuthorityStructure = useMutation({
    mutationFn: ({
      certificationAuthorityStructureId,
      certificationAuthorityStructureLabel,
    }: {
      certificationAuthorityStructureId: string;
      certificationAuthorityStructureLabel: string;
    }) =>
      graphqlClient.request(updateCertificationAuthorityStructureMutation, {
        certificationAuthorityStructureId,
        certificationAuthorityStructureLabel,
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureResponse?.certification_authority_getCertificationAuthorityStructure;
  return {
    certificationAuthorityStructure,
    getCertificationAuthorityStructureStatus,
    updateCertificationAuthorityStructure,
  };
};
