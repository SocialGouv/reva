import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationQuery = graphql(`
  query getCertificationForUpdateCertificationPrerequisitesPage(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      codeRncp
      label
    }
  }
`);

export const useUpdatePrerequisitesPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "certifiactions",
      "getCertificationForUpdateCertificationPrerequisitesPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationResponse?.getCertification;

  return {
    certification,
    getCertificationQueryStatus,
  };
};
