import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

export const MultipleCertificationAuthoritiesSummaryCard = ({
  buttonOnClickHref,
}: {
  buttonOnClickHref: string;
}) => (
  <EnhancedSectionCard
    title="Certificateur"
    isEditable
    buttonOnClickHref={buttonOnClickHref}
    status="TO_COMPLETE"
    data-testid="multiple-certification-authorities-summary-card"
  >
    <SmallNotice>
      Parmi la liste des certificateurs, sélectionnez celui qui suivra la
      candidature et organisera le passage devant le jury.
    </SmallNotice>
  </EnhancedSectionCard>
);
