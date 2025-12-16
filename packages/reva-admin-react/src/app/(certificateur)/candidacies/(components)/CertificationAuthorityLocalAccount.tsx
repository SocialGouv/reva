import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccountLabelAdminQuery = graphql(`
  query getCertificationAuthorityLocalAccountLabelAdminQuery(
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
      certificationAuthority {
        label
      }
    }
  }
`);

const useCertificationAuthorityLocalAccount = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: certificationAuthorityLocalAccountData } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "certificationAuthorityLocalAccount",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityLocalAccountLabelAdminQuery,
        {
          certificationAuthorityLocalAccountId,
        },
      ),
  });

  return {
    certificationAuthorityLocalAccount:
      certificationAuthorityLocalAccountData?.certification_authority_getCertificationAuthorityLocalAccount,
  };
};

interface Props {
  certificationAuthorityLocalAccountId: string;
}

export const CertificationAuthorityLocalAccount = (
  props: Props,
): React.ReactNode => {
  const { certificationAuthorityLocalAccountId } = props;

  const { certificationAuthorityLocalAccount } =
    useCertificationAuthorityLocalAccount({
      certificationAuthorityLocalAccountId,
    });

  if (!certificationAuthorityLocalAccount) return null;

  return (
    <div className="flex flex-col">
      <div className="flex gap-2">
        <span className="fr-icon-home-4-fill" aria-hidden="true"></span>
        <strong className="text-xl">
          {certificationAuthorityLocalAccount.certificationAuthority.label}
        </strong>
      </div>

      <div className="flex gap-2">
        {certificationAuthorityLocalAccount.account.firstname}
        {certificationAuthorityLocalAccount.account.lastname}
      </div>
    </div>
  );
};
