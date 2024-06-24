import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityLocalAccounts($certificationAuthorityId: ID!) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      certificationAuthorityLocalAccounts {
        id
        account {
          email
          firstname
          lastname
        }
        departments {
          id
        }
        certifications {
          id
        }
      }
    }
  }
`);

export const useCertificationAuthorityLocalAccounts = (
  certificationAuthorityId: string,
) => {
  const { graphqlClient } = useGraphQlClient();

  const certificationAuthority = useQuery({
    queryKey: [certificationAuthorityId],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityQuery, {
        certificationAuthorityId,
      }),
  });

  return { certificationAuthority };
};
