import Badge from "@codegouvfr/react-dsfr/Badge";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export default function GeneralInformationCard({
  hrefPrefix,
  certificationAuthority,
}: {
  hrefPrefix: string;
  certificationAuthority: {
    id: string;
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
}) {
  const isComplete =
    certificationAuthority.contactFullName &&
    certificationAuthority.contactEmail;
  return (
    <EnhancedSectionCard
      title="Informations générales"
      titleIconClass="fr-icon-information-fill"
      isEditable
      status={isComplete ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={`${hrefPrefix}/informations-generales`}
      data-testid="certification-authority-general-information-card"
    >
      <div className="pl-10">
        <p
          className="text-xl font-bold mb-2"
          data-testid="certification-authority-label"
        >
          {certificationAuthority.label}
        </p>
        {isComplete ? (
          <>
            <div className="flex gap-x-2">
              <p>Contact référent :</p>
              <div>
                <p className="my-0 font-medium" data-testid="contact-full-name">
                  {certificationAuthority.contactFullName}
                </p>
                <p className="my-0 font-medium" data-testid="contact-email">
                  {certificationAuthority.contactEmail}
                </p>
                <p className="my-0 font-medium" data-testid="contact-phone">
                  {certificationAuthority.contactPhone}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-y-6">
            <Badge severity="new" small data-testid="no-contact-badge">
              Aucun contact référent
            </Badge>
            <SmallNotice className="-ml-10" data-testid="no-contact-notice">
              Ajoutez un contact référent pour améliorer le suivi et la
              communication avec les AAP et les candidats
            </SmallNotice>
          </div>
        )}
      </div>
    </EnhancedSectionCard>
  );
}
