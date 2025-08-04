import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccount = graphql(`
  query getCertificationAuthorityLocalAccountForCertificationsLocalAccountPage {
    account_getAccountForConnectedUser {
      certificationAuthorityLocalAccount {
        certifications {
          id
          label
        }
      }
    }
  }
`);

export const useCertificationsLocalAccountPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [
      "account_getAccountForConnectedUser",
      "certificationAuthorityLocalAccount",
      "CertificationsLocalAccountPage",
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
