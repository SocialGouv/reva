import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

import { SectionCard } from "@/components/card/section-card/SectionCard";

export const CertificationAuthorityLocalAccountsSummaryCard = ({
  accounts,
  updateLocalAccountPageUrl,
  addLocalAccountPageUrl,
}: {
  accounts: {
    id: string;
    contactEmail?: string | null;
    account: {
      id: string;
      firstname?: string | null;
      lastname?: string | null;
      email: string;
    };
  }[];
  addLocalAccountPageUrl: string;
  updateLocalAccountPageUrl: string;
}) => {
  const router = useRouter();
  return (
    <SectionCard
      data-testid="certification-authority-local-accounts-summary-card"
      title="Comptes locaux"
      titleIconClass="fr-icon-team-fill"
      hasButton={true}
      buttonTitle="Ajouter un compte"
      buttonOnClick={() => router.push(addLocalAccountPageUrl)}
      buttonPriority="secondary"
    >
      <ul
        className="list-none"
        data-testid="certification-authority-local-accounts-summary-card-list"
      >
        {accounts.map(({ account, id, contactEmail }) => (
          <li
            key={account.id}
            className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b"
          >
            <div className="flex flex-col gap-y-2">
              <span className="font-bold">
                {account.firstname} {account.lastname}
              </span>
              {contactEmail ? (
                <span>
                  Contact référent : <strong>{contactEmail}</strong>
                </span>
              ) : (
                <Badge
                  severity="new"
                  small
                  data-testid="no-contact-referent-badge"
                >
                  Aucun contact référent
                </Badge>
              )}
            </div>
            <span>
              <Button
                data-testid="update-local-account-button"
                priority="tertiary no outline"
                size="small"
                linkProps={{
                  href: `${updateLocalAccountPageUrl}/${id}`,
                }}
              >
                Modifier
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
};
