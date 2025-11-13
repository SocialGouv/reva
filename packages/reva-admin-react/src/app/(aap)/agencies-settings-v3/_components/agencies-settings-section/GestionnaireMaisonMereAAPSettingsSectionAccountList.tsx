import { Button } from "@codegouvfr/react-dsfr/Button";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { Impersonate } from "@/components/impersonate/Impersonate.component";

import { Account } from "@/graphql/generated/graphql";

export const GestionnaireMaisonMereAAPSettingsSectionAccountList = ({
  maisonMereAAPId,
  gestionnaireAccountId,
  organisms,
  isAdmin,
}: {
  maisonMereAAPId: string;
  gestionnaireAccountId: string;
  organisms: {
    accounts: Account[];
    modaliteAccompagnement: "A_DISTANCE" | "LIEU_ACCUEIL";
  }[];
  isAdmin?: boolean;
}) => {
  const { isFeatureActive } = useFeatureflipping();
  const isUserAccountV2Featureactive = isFeatureActive("AAP_USER_ACCOUNT_V2");

  return (
    <ul className="ml-6 mb-8">
      {organisms.map((organism) =>
        organism.accounts
          .filter((account) => account.id !== gestionnaireAccountId)
          .filter((account) => isAdmin || !account.disabledAt)
          .map((account) => (
            <li
              data-testid={account.id}
              key={account.id}
              className="flex justify-between items-center py-3 border-neutral-300 border-t last:border-b"
            >
              <div className="flex items-center gap-x-6">
                <div>
                  <span className="font-bold">
                    {account.firstname} {account.lastname}
                  </span>
                  {" - "}
                  {account.email}
                </div>
              </div>
              <div className="flex justify-between items-center">
                {!account.disabledAt && isAdmin && (
                  <Impersonate accountId={account.id} size="small" />
                )}

                <Button
                  linkProps={
                    isUserAccountV2Featureactive
                      ? {
                          href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts-v2/${account.id}`,
                        }
                      : {
                          href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/${account.id}`,
                        }
                  }
                  priority="tertiary no outline"
                  size="small"
                >
                  {!account.disabledAt ? "Modifier" : "Visualiser"}
                </Button>
              </div>
            </li>
          )),
      )}
    </ul>
  );
};
