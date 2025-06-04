import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export default function CertificationPrerequisitesCard({
  prerequisites,
  isEditable,
  customButtonTitle,
  buttonOnClickHref,
}: {
  prerequisites: { id: string; label: string }[];
  isEditable: boolean;
  customButtonTitle?: string;
  buttonOnClickHref?: string;
}) {
  return (
    <EnhancedSectionCard
      data-test="prerequisites-summary-card"
      isEditable={isEditable}
      buttonOnClickHref={buttonOnClickHref}
      customButtonTitle={customButtonTitle}
      title="Prérequis obligatoires"
      titleIconClass="fr-icon-success-fill"
    >
      {prerequisites.length ? (
        <ul className="ml-10" data-test="prerequisite-list">
          {prerequisites.map((p) => (
            <li key={p.id} data-test="prerequisite">
              {p.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="ml-10 mb-0" data-test="no-prerequisite-message">
          Aucun prérequis renseigné pour cette certification.
        </p>
      )}
    </EnhancedSectionCard>
  );
}
