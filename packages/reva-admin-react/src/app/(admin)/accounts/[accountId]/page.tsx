"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import AccountForm from "../components/account-form/AccountForm.component";
import OrganismForm from "../components/organism-form/OrganismForm.component";
import CertificationAuthorityForm from "../components/certification-authority-form/CertificationAuthority.component";
import { BackButton } from "@/components/back-button/BackButton";
import Button from "@codegouvfr/react-dsfr/Button";
import { useHooksAccount } from "./account.hooks";
import { useAuth } from "@/components/auth/auth";
import { CopyClipBoard } from "@/components/copy-clip-board";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

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

  const { isFeatureActive } = useFeatureflipping();
  const { isAdmin } = useAuth();
  const { getImpersonateUrl } = useHooksAccount();
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
      <div className="flex-1 px-8 py-4">
        <BackButton
          href={`/accounts/${
            organism ? "organisms" : "certification-authorities"
          }`}
        >
          Toutes les comptes
        </BackButton>

        <div className="flex justify-between">
          <h1>Compte utilisateur</h1>

          {isFeatureActive("IMPERSONATE") && isAdmin && (
            <CopyClipBoard
              onClick={async (callback) => {
                const url = await getImpersonateUrl(account.id);
                if (url) {
                  callback(url);
                }
              }}
            >
              <Button priority="secondary" type="button">
                Impersonate
              </Button>
            </CopyClipBoard>
          )}
        </div>

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
