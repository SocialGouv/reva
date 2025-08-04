import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccount = graphql(`
  query getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage {
    account_getAccountForConnectedUser {
      certificationAuthorityLocalAccount {
        contactFullName
        contactEmail
        departments {
          id
          label
          code
          region {
            id
            label
          }
        }
        certifications {
          id
        }
      }
    }
  }
`);

export const useLocalAccountSettingsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [
      "account_getAccountForConnectedUser",
      "certificationAuthorityLocalAccount",
      "CertificationAuthorityLocalAccountSettingsPage",
    ],
    queryFn: () => graphqlClient.request(getCertificationAuthorityLocalAccount),
  });

  const certificationAuthorityLocalAccount =
    data?.account_getAccountForConnectedUser
      ?.certificationAuthorityLocalAccount;
  return {
    certificationAuthorityLocalAccount,
  };
};
