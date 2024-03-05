"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import AccountForm from "../components/account-form/AccountForm.component";
import OrganismForm from "../components/organism-form/OrganismForm.component";
import CertificationAuthorityForm from "../components/certification-authority-form/CertificationAuthority.component";

const getAccount = graphql(`
  query getAccount($accountId: ID!) {
    account_getAccount(id: $accountId) {
      id
      firstname
      lastname
      email
      organism {
        id
        label
        website
        contactAdministrativeEmail
        contactAdministrativePhone
        isActive
      }
      certificationAuthority {
        id
        label
        contactFullName
        contactEmail
      }
    }
  }
`);

const AccountPage = () => {
  const { accountId }: { accountId: string } = useParams();

  const { graphqlClient } = useGraphQlClient();

  const { data: getAccountResponse } = useQuery({
    queryKey: ["getAccount", accountId],
    queryFn: () =>
      graphqlClient.request(getAccount, {
        accountId,
      }),
  });

  const account = getAccountResponse?.account_getAccount;

  if (!account) {
    return <></>;
  }

  const organism = account.organism;
  const certificationAuthority = account.certificationAuthority;

  return (
    account && (
      <div className="flex flex-col flex-1 px-8 py-4 gap-8">
        <Link
          href={`/accounts/${
            organism ? "organisms" : "certification-authorities"
          }`}
          className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
        >
          Toutes les comptes
        </Link>

        <h1 className="text-4xl font-bold">Compte utilisateur</h1>

        <AccountForm account={account} />

        {organism && <OrganismForm organism={organism} />}

        {certificationAuthority && (
          <CertificationAuthorityForm
            certificationAuthority={certificationAuthority}
          />
        )}
      </div>
    )
  );
};

export default AccountPage;
