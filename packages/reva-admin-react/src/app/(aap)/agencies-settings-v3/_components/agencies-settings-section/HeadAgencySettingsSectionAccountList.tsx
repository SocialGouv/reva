export const HeadAgencySettingsSectionAccountList = ({
  organisms,
}: {
  organisms: {
    accounts: {
      id: string;
      firstname?: string | null;
      lastname?: string | null;
      email: string;
    }[];
    isRemote: boolean;
    isOnSite: boolean;
  }[];
}) => (
  <ul data-test="account-list" className="ml-6 mb-8">
    {organisms.map((organism) =>
      organism.accounts.map((account) => (
        <li
          data-test={account.id}
          key={account.id}
          className="flex gap-x-6 py-3 border-neutral-300 border-t last:border-b"
        >
          {organism.isRemote && (
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
        </li>
      )),
    )}
  </ul>
);
