import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityGeneralInfoForEditPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
        contactFullName
        contactEmail
        contactPhone
        account {
          id
          email
          firstname
          lastname
        }
        certificationAuthorityStructures {
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
