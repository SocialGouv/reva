import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAndParcoursQuery = graphql(`
  query getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery(
    $certificationId: ID!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
    }
  }
`);

export const useParcoursCertificationPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const {
    data: getCertificationAndParcoursResponse,
    status: getCertificationAndParcoursStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "getCertificationAndParcoursForCertificationAuthorityParcoursPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAndParcoursQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationAndParcoursResponse?.getCertification;
  return {
    certification,
    getCertificationAndParcoursStatus,
  };
};
