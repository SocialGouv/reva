import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCertificationQuery = graphql(`
  query getCertificationForUpdateCertificationPage($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      status
      statusV2
      rncpExpiresAt
      rncpDeliveryDeadline
      availableAt
      typeDiplome
      degree {
        id
        label
      }
      domains {
        id
        code
        label
        children {
          id
          code
          label
        }
      }
      competenceBlocs {
        id
        code
        label
        competences {
          id
          label
        }
      }
      certificationAuthorityStructure {
        id
        label
        certificationRegistryManager {
          id
        }
      }
      certificationAuthorities {
        id
        label
      }
    }
  }
`);

const sendCertificationToRegistryManagerMutation = graphql(`
  mutation sendCertificationToRegistryManagerForUpdateCertificationStructurePage(
    $input: SendCertificationToRegistryManagerInput!
  ) {
    referential_sendCertificationToRegistryManager(input: $input) {
      id
    }
  }
`);

export const useUpdateCertificationPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationQueryResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "certifications",
      "getCertificationForUpdateCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationQueryResponse?.getCertification;

  const sendCertificationToRegistryManager = useMutation({
    mutationFn: () =>
      graphqlClient.request(sendCertificationToRegistryManagerMutation, {
        input: { certificationId },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationId],
      }),
  });

  return {
    certification,
    getCertificationQueryStatus,
    sendCertificationToRegistryManager,
  };
};
