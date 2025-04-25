import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityForCertificationAuthoritySettingsPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        certificationAuthorityLocalAccounts {
          id
          account {
            id
            firstname
            lastname
            email
          }
        }
      }
    }
  }
`);

export const useCertificationAuthoritySettings = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityResponse,
    status: getCertificationAuthorityStatus,
  } = useQuery({
    queryKey: [
      "getCertificationAuthorityForCertificationAuthoritySettingsPage",
    ],
    queryFn: () => graphqlClient.request(getCertificationAuthority),
  });

  const certificationAuthority =
    getCertificationAuthorityResponse?.account_getAccountForConnectedUser
      ?.certificationAuthority;

  return { certificationAuthority, getCertificationAuthorityStatus };
};
