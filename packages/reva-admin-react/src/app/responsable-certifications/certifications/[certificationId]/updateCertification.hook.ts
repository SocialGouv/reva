import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationQuery = graphql(`
  query getCertificationForCertificationRegistryManagerUpdateCertificationPage(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      competenceBlocs {
        id
        code
        label
        competences {
          id
          label
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
      "getCertificationForCertificationRegistryManagerUpdateCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationQueryResponse?.getCertification;

  return {
    certification,
    getCertificationQueryStatus,
  };
};
