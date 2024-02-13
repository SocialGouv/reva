import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";

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
        level
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
      level
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
    getCertificationAuthorityTags
  }
`);

const updateCertificatioMutation = graphql(`
  mutation updateCertificatioMutation($input: UpdateCertificationInput!) {
    referential_updateCertification(input: $input) {
      id
    }
  }
`);

const replaceCertificationMutation = graphql(`
  mutation replaceCertificatioMutation($input: UpdateCertificationInput!) {
    referential_replaceCertification(input: $input) {
      id
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

  const updateCertification = useMutation({
    mutationFn: (input: {
      label: string;
      level: number;
      codeRncp: string;
      typeDiplomeId: string;
      certificationAuthorityTag: string;
      domaineIds: string[];
      conventionCollectiveIds: string[];
      availableAt: number;
      expiresAt: number;
    }) =>
      graphqlClient.request(updateCertificatioMutation, {
        input: { ...input, certificationId },
      }),
  });

  const replaceCertification = useMutation({
    mutationFn: (input: {
      label: string;
      level: number;
      codeRncp: string;
      typeDiplomeId: string;
      certificationAuthorityTag: string;
      domaineIds: string[];
      conventionCollectiveIds: string[];
      availableAt: number;
      expiresAt: number;
    }) =>
      graphqlClient.request(replaceCertificationMutation, {
        input: { ...input, certificationId },
      }),
  });

  return {
    certification: getCertificationResponse?.getCertification,
    degrees: getReferentialResponse?.getDegrees,
    typeDiplomes: getReferentialResponse?.getTypeDiplomes,
    domaines: getReferentialResponse?.getDomaines,
    conventionCollectives: getReferentialResponse?.getConventionCollectives,
    certificationAuthorityTags:
      getReferentialResponse?.getCertificationAuthorityTags,
    updateCertification,
    replaceCertification,
  };
};
