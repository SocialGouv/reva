import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityGeneralInfoForEditPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
        contactFullName
        contactEmail
        contactPhone
        websiteUrl
        account {
          id
          email
          firstname
          lastname
        }
        certificationAuthorityStructures {
          hasReducedRequirements
          id
          label
        }
      }
    }
  }
`);

export const useCertificationAuthority = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityResponse,
    status: getCertificationAuthorityStatus,
  } = useQuery({
    queryKey: ["getCertificationAuthorityGeneralInfoForCertificator"],
    queryFn: () => graphqlClient.request(getCertificationAuthority),
  });

  const certificationAuthority =
    getCertificationAuthorityResponse?.account_getAccountForConnectedUser
      ?.certificationAuthority;

  return { certificationAuthority, getCertificationAuthorityStatus };
};
