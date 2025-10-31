import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export const AddCertificationAuthorityLocalAccountPageContent = ({
  generalInformationPageUrl,
}: {
  generalInformationPageUrl: string;
}) => (
  <div className="w-full flex flex-col gap-8">
    <EnhancedSectionCard
      data-testid="local-account-general-information-summary-card"
      title="Informations générales"
      titleIconClass="fr-icon-information-fill"
      status="TO_COMPLETE"
      isEditable
      buttonOnClickHref={generalInformationPageUrl}
    >
      <SmallNotice>
        Commencez par remplir les informations générales liées au compte.
      </SmallNotice>
    </EnhancedSectionCard>
    <EnhancedSectionCard
      title="Zone d’intervention"
      titleIconClass="fr-icon-road-map-fill"
      status="TO_COMPLETE"
      isEditable
      buttonOnClickHref="#"
      disabled
    />
    <EnhancedSectionCard
      title="Certifications gérées"
      titleIconClass="fr-icon-award-fill"
      status="TO_COMPLETE"
      isEditable
      buttonOnClickHref="#"
      disabled
    />
  </div>
);
