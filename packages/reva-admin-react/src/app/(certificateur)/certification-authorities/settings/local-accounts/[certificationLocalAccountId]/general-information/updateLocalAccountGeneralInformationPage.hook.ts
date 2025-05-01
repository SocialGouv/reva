import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage(
    $certificationLocalAccountId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
        email
      }
      contactFullName
      contactEmail
      contactPhone
      certificationAuthority {
        label
      }
    }
  }
`);

export const useUpdateLocalAccountGeneralInformationPage = ({
  certificationLocalAccountId,
}: {
  certificationLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: ["certification_authority_getCertificationAuthorityLocalAccount"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationLocalAccountId,
      }),
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  return {
    certificationAuthorityLocalAccount,
  };
};
