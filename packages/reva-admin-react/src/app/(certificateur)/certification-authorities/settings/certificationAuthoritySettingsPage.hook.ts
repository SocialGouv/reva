import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityForCertificationAuthoritySettingsPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
        contactFullName
        contactEmail
        contactPhone
        certificationAuthorityLocalAccounts {
          id
          contactEmail
          account {
            id
            firstname
            lastname
            email
          }
        }
        regions {
          id
          label
          departments {
            id
            label
            code
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
