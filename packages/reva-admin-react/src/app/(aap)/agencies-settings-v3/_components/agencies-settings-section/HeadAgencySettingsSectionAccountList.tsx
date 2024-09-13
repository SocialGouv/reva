import { Button } from "@codegouvfr/react-dsfr/Button";

export const HeadAgencySettingsSectionAccountList = ({
  maisonMereAAPId,
  headAgencyAccountId,
  organisms,
}: {
  maisonMereAAPId: string;
  headAgencyAccountId: string;
  organisms: {
    accounts: {
      id: string;
      firstname?: string | null;
      lastname?: string | null;
      email: string;
    }[];
    isRemote: boolean;
    isOnSite: boolean;
    isHeadAgency: boolean;
  }[];
}) => (
  <ul className="ml-6 mb-8">
    {organisms.map((organism) =>
      organism.accounts
        .filter((account) => account.id !== headAgencyAccountId)
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
            <Button
              linkProps={{
                href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/${account.id}`,
              }}
              priority="tertiary no outline"
              size="small"
            >
              Modifier
            </Button>
          </li>
        )),
    )}
  </ul>
);
