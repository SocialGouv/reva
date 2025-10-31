import Badge from "@codegouvfr/react-dsfr/Badge";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export default function LocalAccountGeneralInformationSummaryCard({
  contactFullName,
  contactEmail,
  updateGeneralInformationPageUrl,
}: {
  contactFullName?: string | null;
  contactEmail?: string | null;
  updateGeneralInformationPageUrl: string;
  status?: "TO_COMPLETE" | "COMPLETED";
}) {
  return (
    <EnhancedSectionCard
      data-testid="local-account-general-information-summary-card"
      title="Informations générales"
      titleIconClass="fr-icon-information-fill"
      isEditable
      status={contactEmail ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={updateGeneralInformationPageUrl}
    >
      <div className="pl-10">
        {contactFullName ? (
          <div className="flex gap-x-2">
            <p>Contact référent :</p>
            <div>
              <p className="my-0 font-medium" data-testid="contact-full-name">
                {contactFullName}
              </p>
              <p className="my-0 font-medium" data-testid="contact-email">
                {contactEmail}
              </p>
            </div>
          </div>
        ) : (
          <Badge severity="new" small data-testid="no-contact-details-badge">
            Aucun contact référent
          </Badge>
        )}
      </div>
    </EnhancedSectionCard>
  );
}
