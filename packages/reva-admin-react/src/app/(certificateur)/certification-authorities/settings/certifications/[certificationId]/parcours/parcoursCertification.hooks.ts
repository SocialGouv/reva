import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAndParcoursQuery = graphql(`
  query getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery(
    $certificationId: ID!
    $parcoursOffset: Int!
    $parcoursLimit: Int!
  ) {
    getCertification(certificationId: $certificationId) {
      id
      label
      parcours(offset: $parcoursOffset, limit: $parcoursLimit) {
        rows {
          id
          label
          nomEtablissement
        }
        info {
          totalRows
          totalPages
        }
      }
    }
  }
`);

export const useParcoursCertificationPage = ({
  certificationId,
  page,
}: {
  certificationId: string;
  page: number;
}) => {
  const RECORDS_PER_PAGE = 10;
  const parcoursOffset = (page - 1) * RECORDS_PER_PAGE;

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
        parcoursOffset,
        parcoursLimit: RECORDS_PER_PAGE,
      }),
  });

  const certification = getCertificationAndParcoursResponse?.getCertification;
  return {
    certification,
    getCertificationAndParcoursStatus,
  };
};
