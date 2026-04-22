import Badge from "@codegouvfr/react-dsfr/Badge";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { format } from "date-fns";
import { useParams } from "next/navigation";

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
  const { candidacyId } = useParams();
  const isEligibilityPartComplete = !!eligibilityRequirement;

  return (
    <EnhancedSectionCard
      title="Recevabilité du candidat"
      titleIconClass="ri-folder-check-fill"
      status={isEligibilityPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/eligibility`}
      isEditable={isFeasibilityEditable}
      data-testid="eligibility-section"
    >
      {isEligibilityPartComplete ? (
        <>
          <EligibiltyBadge eligibilityRequirement={eligibilityRequirement} />
          {eligibilityValidUntil && (
            <>
              <p className="mb-0 mt-4">Date de fin de validité</p>
              <p className="font-medium mb-4">
                {format(eligibilityValidUntil, "dd/MM/yyyy")}
              </p>
              <CallOut className="mb-0">
                Le candidat s'engage à respecter le délai de fin de validité de
                la recevabilité
              </CallOut>
            </>
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
