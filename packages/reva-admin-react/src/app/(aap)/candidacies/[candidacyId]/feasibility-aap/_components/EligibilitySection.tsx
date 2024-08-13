import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useParams } from "next/navigation";

const EligibiltyBadge = ({
  eligibilityRequirement,
}: {
  eligibilityRequirement: string;
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
}: {
  eligibilityRequirement?:
    | "FULL_ELIGIBILITY_REQUIREMENT"
    | "PARTIAL_ELIGIBILITY_REQUIREMENT"
    | null;
}) => {
  const { candidacyId } = useParams();
  const isEligibilityPartComplete = !!eligibilityRequirement;

  return (
    <DefaultCandidacySectionCard
      title="Recevabilité du candidat"
      titleIconClass="ri-folder-check-fill"
      status={isEligibilityPartComplete ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/eligibility`}
      isEditable
    >
      {isEligibilityPartComplete ? (
        <EligibiltyBadge eligibilityRequirement={eligibilityRequirement} />
      ) : (
        <p>
          Renseignez la situation dans laquelle se trouve votre candidat
          (première demande, recevabilité favorable en cours...) pour accéder à
          un dossier de faisabilité adapté.
        </p>
      )}
    </DefaultCandidacySectionCard>
  );
};
