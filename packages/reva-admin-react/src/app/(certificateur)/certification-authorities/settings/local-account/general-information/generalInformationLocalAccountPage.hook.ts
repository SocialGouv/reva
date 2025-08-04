import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccount = graphql(`
  query getCertificationAuthorityLocalAccountForGeneralInformationLocalAccountPage {
    account_getAccountForConnectedUser {
      certificationAuthorityLocalAccount {
        contactFullName
        contactEmail
        contactPhone
        account {
          firstname
          lastname
          email
        }
      }
    }
  }
`);

export const useGeneralInformationLocalAccountPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [
      "account_getAccountForConnectedUser",
      "certificationAuthorityLocalAccount",
      "GeneralInformationLocalAccountPage",
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
