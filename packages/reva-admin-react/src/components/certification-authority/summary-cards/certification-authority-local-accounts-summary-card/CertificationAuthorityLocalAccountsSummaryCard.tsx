import { SectionCard } from "@/components/card/section-card/SectionCard";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

export const CertificationAuthorityLocalAccountsSummaryCard = ({
  accounts,
  updateLocalAccountPageUrl,
  addLocalAccountPageUrl,
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
  addLocalAccountPageUrl: string;
  updateLocalAccountPageUrl: string;
}) => {
  const router = useRouter();
  return (
    <SectionCard
      title="Comptes locaux"
      titleIconClass="fr-icon-team-fill"
      hasButton={true}
      buttonTitle="Ajouter un compte"
      buttonOnClick={() => router.push(addLocalAccountPageUrl)}
      buttonPriority="secondary"
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
