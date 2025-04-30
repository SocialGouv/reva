import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityForAddCertificationAuthorityLocalAccountPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
      }
    }
  }
`);

export const useAddLocalAccountGeneralInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: ["certification_authority_getCertificationAuthority"],
    queryFn: () => graphqlClient.request(getCertificationAuthorityQuery),
  });

  const certificationAuthority =
    data?.account_getAccountForConnectedUser?.certificationAuthority;

  return { certificationAuthority };
};
