import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import {
  CertificationRegistryManagerInput,
  UpdateCertificationRegistryManagerInput,
} from "@/graphql/generated/graphql";

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

const updateCertificationRegistryManagerMutation = graphql(`
  mutation updateCertificationRegistryManager(
    $data: UpdateCertificationRegistryManagerInput!
  ) {
    certification_authority_updateCertificationRegistryManager(input: $data) {
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
  const queryClient = useQueryClient();

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

  const updateCertificationRegistryManager = useMutation({
    mutationFn: (data: UpdateCertificationRegistryManagerInput) =>
      graphqlClient.request(updateCertificationRegistryManagerMutation, {
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityStructureId],
      });
    },
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureWithRegistryManagerResponse?.certification_authority_getCertificationAuthorityStructure;
  return {
    certificationAuthorityStructure,
    getCertificationRegistryManagerStatus,
    createCertificationRegistryManager,
    updateCertificationRegistryManager,
  };
};
