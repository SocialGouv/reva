import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationQuery = graphql(`
  query getCertificationForUpdateCertificationPage($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      status
      rncpExpiresAt
      rncpDeliveryDeadline
      availableAt
      typeDiplome {
        id
        label
      }
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
        certificationAuthorities {
          id
          label
        }
        certificationRegistryManager {
          id
        }
      }
    }
  }
`);

export const useUpdateCertificationPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
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

  return { certification, getCertificationQueryStatus };
};
