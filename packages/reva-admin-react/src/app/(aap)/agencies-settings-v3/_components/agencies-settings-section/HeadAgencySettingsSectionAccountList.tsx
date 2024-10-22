import { DisableAccount } from "@/components/disable-account";
import { Impersonate } from "@/components/impersonate";
import { Account } from "@/graphql/generated/graphql";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const HeadAgencySettingsSectionAccountList = ({
  maisonMereAAPId,
  gestionnaireAccountId,
  organisms,
  isAdmin,
}: {
  maisonMereAAPId: string;
  gestionnaireAccountId: string;
  organisms: {
    accounts: Account[];
    isRemote: boolean;
    isOnSite: boolean;
    isHeadAgency: boolean;
  }[];
  isAdmin?: boolean;
}) => (
  <ul className="ml-6 mb-8">
    {organisms.map((organism) =>
      organism.accounts
        .filter((account) => account.id !== gestionnaireAccountId)
        .filter((account) => isAdmin || !account.disabledAt)
        .map((account) => (
          <li
            data-test={account.id}
            key={account.id}
            className="flex justify-between items-center py-3 border-neutral-300 border-t last:border-b"
          >
            <div className="flex items-center gap-x-6">
              {(organism.isRemote || organism.isHeadAgency) && (
                <i
                  data-test="remote-badge"
                  className="fr-icon-headphone-fill fr-icon--sm"
                ></i>
              )}
              {organism.isOnSite && (
                <i
                  data-test="on-site-badge"
                  className="fr-icon-home-4-fill fr-icon--sm"
                ></i>
              )}
              <div>
                <span className="font-bold">
                  {account.firstname} {account.lastname}
                </span>
                {" - "}
                {account.email}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Button
                linkProps={{
                  href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/${account.id}`,
                }}
                priority="tertiary no outline"
                size="small"
              >
                {!account.disabledAt ? "Modifier" : "Visualiser"}
              </Button>

              {!account.disabledAt && isAdmin && (
                <DisableAccount accountId={account.id} size="small" />
              )}

              {!account.disabledAt && isAdmin && (
                <Impersonate accountId={account.id} size="small" />
              )}
            </div>
          </li>
        )),
    )}
  </ul>
);
