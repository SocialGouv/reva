import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export const CertificationAuthoritySummaryCardV2 = ({
  label,
  viewCertificationAuthorityDetailsHref,
  isEditable = false,
}: {
  label?: string | null;
  viewCertificationAuthorityDetailsHref: string;
  isEditable?: boolean;
}) => (
  <EnhancedSectionCard
    title="Certificateur"
    isEditable
    buttonOnClickHref={viewCertificationAuthorityDetailsHref}
    customButtonTitle={isEditable ? "Modifier" : "Consulter"}
    data-testid="certification-authority-summary-card"
  >
    <p className="text-xl font-bold mb-0 mr-6 leading-loose">{label}</p>
  </EnhancedSectionCard>
);
