import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

import { DffEligibilityRequirement } from "@/graphql/generated/graphql";

const EligibiltyBadge = ({
  eligibilityRequirement,
}: {
  eligibilityRequirement: DffEligibilityRequirement | null;
}) => {
  if (eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT") {
    return (
      <Badge severity="info">Accès au dossier de faisabilité intégral</Badge>
    );
  }
  if (eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT") {
    return <Badge severity="new">Accès au dossier de faisabilité adapté</Badge>;
  }
  return null;
};

export const EligibilitySection = ({
  eligibilityRequirement,
  eligibilityValidUntil,
  isFeasibilityEditable,
}: {
  eligibilityRequirement?: DffEligibilityRequirement | null;
  eligibilityValidUntil: Date | null;
  isFeasibilityEditable: boolean;
}) => {
  const isEligibilityPartComplete = !!eligibilityRequirement;

  return (
    <EnhancedSectionCard
      title="Recevabilité déjà acquise"
      titleIconClass="ri-folder-check-fill"
      status={isEligibilityPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={`./eligibility`}
      isEditable={isFeasibilityEditable}
      data-testid="eligibility-section"
    >
      {isEligibilityPartComplete ? (
        <>
          <EligibiltyBadge eligibilityRequirement={eligibilityRequirement} />
          {eligibilityValidUntil && (
            <div className="mt-4 flex flex-row justify-between items-center px-4 py-2 border-t border-b border-dsfr-light-border-default">
              <p className="m-0">Date de fin de validité</p>
              <p className="font-medium m-0">
                {format(eligibilityValidUntil, "dd/MM/yyyy")}
              </p>
            </div>
          )}
        </>
      ) : (
        <p>
          Renseignez la situation dans laquelle se trouve votre candidat
          (première demande, recevabilité favorable en cours...) pour accéder à
          un dossier de faisabilité adapté.
        </p>
      )}
    </EnhancedSectionCard>
  );
};
