import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      status
      expiresAt
      availableAt
      certificationAuthorities {
        id
        label
        certificationAuthorityLocalAccounts {
          id
          account {
            id
            email
            firstname
            lastname
          }
        }
      }
      typeDiplome {
        id
        label
      }
      certificationAuthorityTag
      degree {
        id
        longLabel
      }
      conventionsCollectives {
        id
        label
      }
      domaines {
        id
        label
      }
    }
  }
`);

const getReferentialForCertificationQuery = graphql(`
  query getReferentialForCertification {
    getDegrees {
      id
      longLabel
    }
    getTypeDiplomes {
      id
      label
    }
    getDomaines {
      id
      label
    }
    getConventionCollectives {
      id
      label
    }
  }
`);

export const useCertificationQueries = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationResponse } = useQuery({
    queryKey: ["getCertification", certificationId],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const { data: getReferentialResponse } = useQuery({
    queryKey: ["getReferential"],
    queryFn: () => graphqlClient.request(getReferentialForCertificationQuery),
  });

  return {
    certification: getCertificationResponse?.getCertification,
    degrees: getReferentialResponse?.getDegrees,
    typeDiplomes: getReferentialResponse?.getTypeDiplomes,
    domaines: getReferentialResponse?.getDomaines,
    conventionCollectives: getReferentialResponse?.getConventionCollectives,
  };
};
