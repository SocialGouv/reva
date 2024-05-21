import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const CompanySummary = () => {
  const { professionalSpaceInfos, goBackToPreviousStep } =
    useProfessionalSpaceSubscriptionContext();

  return (
    <div className="shrink-0 w-1/4">
      <div className="hidden md:block min-h-[720px] bg-neutral-100 p-6 mb-12">
        <h2>Résumé</h2>
        <div className="flex flex-col gap-y-2">
          <Badge severity="success">Siège social</Badge>
          <Badge severity="success">En activité</Badge>
          <Badge severity="success">Qualiopi VAE Actif</Badge>
        </div>
      </div>
      <Button priority="secondary" onClick={goBackToPreviousStep}>
        Retour
      </Button>
    </div>
  );
};
