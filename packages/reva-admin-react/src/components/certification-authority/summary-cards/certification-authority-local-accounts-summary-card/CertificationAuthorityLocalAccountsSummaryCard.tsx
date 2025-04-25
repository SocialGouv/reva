import { SectionCard } from "@/components/card/section-card/SectionCard";
import Button from "@codegouvfr/react-dsfr/Button";

export const CertificationAuthorityLocalAccountsSummaryCard = ({
  accounts,
  hrefPrefix,
}: {
  accounts: {
    id: string;
    account: {
      id: string;
      firstname?: string | null;
      lastname?: string | null;
      email: string;
    };
  }[];
  hrefPrefix: string;
}) => {
  return (
    <SectionCard
      title="Comptes collaborateurs"
      titleIconClass="fr-icon-team-fill"
    >
      <ul className="list-none font-bold">
        {accounts.map(({ account, id }) => (
          <li
            key={account.id}
            className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b"
          >
            <div className="flex flex-col">
              <span>
                {account.firstname} {account.lastname}
              </span>
              <span className="font-normal">{account.email}</span>
            </div>
            <span>
              <Button
                priority="tertiary no outline"
                size="small"
                linkProps={{
                  href: `${hrefPrefix}/${id}`,
                }}
              >
                Visualiser
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
};
