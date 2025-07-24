import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CertificationRegistryManagerInput } from "@/graphql/generated/graphql";

const getCertificationAuthorityStructureWithRegistryManagerQuery = graphql(`
  query getCertificationAuthorityStructureWithRegistryManager($id: ID!) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      label
      certificationRegistryManager {
        id
        account {
          id
          firstname
          lastname
          email
        }
      }
    }
  }
`);

const createCertificationRegistryManagerMutation = graphql(`
  mutation createCertificationRegistryManager(
    $data: CertificationRegistryManagerInput!
  ) {
    certification_authority_createCertificationRegistryManager(input: $data) {
      id
    }
  }
`);

export const useCertificationRegistryPage = ({
  certificationAuthorityStructureId,
}: {
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityStructureWithRegistryManagerResponse,
    status: getCertificationRegistryManagerStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityStructureId,
      "getCertificationRegistryManager",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureWithRegistryManagerQuery,
        {
          id: certificationAuthorityStructureId,
        },
      ),
  });

  const createCertificationRegistryManager = useMutation({
    mutationFn: (data: CertificationRegistryManagerInput) =>
      graphqlClient.request(createCertificationRegistryManagerMutation, {
        data,
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureWithRegistryManagerResponse?.certification_authority_getCertificationAuthorityStructure;
  return {
    certificationAuthorityStructure,
    getCertificationRegistryManagerStatus,
    createCertificationRegistryManager,
  };
};
