import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

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
        certificationAuthorities {
          id
          label
        }
      }
      certificationAuthorities {
        id
        label
      }
    }
  }
`);

export const useUpdateCertificationStructurePage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

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

  const certification =
    getCertificationStructureAndGestionnairesResponse?.getCertification;

  return {
    getCertificationStructureAndGestionnairesQueryStatus,
    certification,
  };
};
