import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";

const CompanySummaryItem = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return description ? (
    <dl className="text-base text-neutral-900 pl-0 leading-tight">
      <dt className="font-semibold">{title}</dt>
      <dd className="pl-0">{description}</dd>
    </dl>
  ) : (
    <></>
  );
};

function toFullname(firstname?: string, lastname?: string): string | undefined {
  if (!firstname && !lastname) {
    return undefined;
  }
  return `${firstname || ""} ${lastname || ""}`.trim();
}

export const CompanySummary = ({ currentStep }: { currentStep: number }) => {
  const { professionalSpaceInfos, goBackToPreviousStep } =
    useProfessionalSpaceSubscriptionContext();

  const managerFullname = toFullname(
    professionalSpaceInfos.managerFirstname,
    professionalSpaceInfos.managerLastname,
  );

  const accountFullname = toFullname(
    professionalSpaceInfos.accountLastname,
    professionalSpaceInfos.accountFirstname,
  );

  return (
    <div className="flex flex-col justify-between shrink-0 w-1/4">
      <div className="hidden md:block bg-neutral-100 p-6 mb-12">
        <h2 className="mb-4">Résumé</h2>
        <div className="flex flex-col gap-y-2">
          <Badge severity="success">Siège social</Badge>
          <Badge severity="success">En activité</Badge>
          <Badge severity="success">Qualiopi VAE Actif</Badge>
        </div>
        <div className="mt-8 flex flex-col gap-y-4">
          <CompanySummaryItem
            title="Raison sociale"
            description={professionalSpaceInfos.companyName}
          />
          <CompanySummaryItem
            title="Nature juridique"
            description={professionalSpaceInfos.companyLegalStatus}
          />
          <CompanySummaryItem
            title="Dirigeant(e)"
            description={managerFullname}
          />
          <CompanySummaryItem
            title="Administrateur"
            description={
              professionalSpaceInfos.delegataire ? accountFullname : "Dirigeant"
            }
          />
          <CompanySummaryItem
            title="Email"
            description={professionalSpaceInfos.accountEmail}
          />
          <CompanySummaryItem
            title="Téléphone"
            description={professionalSpaceInfos.accountPhoneNumber}
          />
        </div>
      </div>
      <Button priority="secondary" onClick={goBackToPreviousStep}>
        {currentStep > 1 ? `Retour à l'étape ${currentStep - 1}` : "Retour"}
      </Button>
    </div>
  );
};
