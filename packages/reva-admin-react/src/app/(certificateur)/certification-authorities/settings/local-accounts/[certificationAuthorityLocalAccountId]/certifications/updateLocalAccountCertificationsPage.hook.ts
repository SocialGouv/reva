import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
      }
      certifications {
        id
      }
      certificationAuthority {
        certifications {
          id
          label
        }
      }
    }
  }
`);

export const useUpdateLocalAccountCertificationsPage = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
      }),
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  const certificationsFromCertificationAuthority =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certificationAuthority.certifications || [];

  const certificationsFromLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certifications || [];

  return {
    certificationAuthorityLocalAccount,
    certificationsFromCertificationAuthority,
    certificationsFromLocalAccount,
    isLoading,
  };
};
