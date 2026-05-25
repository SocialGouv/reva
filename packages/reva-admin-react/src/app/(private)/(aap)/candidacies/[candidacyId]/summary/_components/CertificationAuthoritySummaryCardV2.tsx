import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export const CertificationAuthoritySummaryCardV2 = ({
  label,
}: {
  label?: string | null;
}) => (
  <EnhancedSectionCard title="Certificateur">
    <p className="text-xl font-bold mb-0 mr-6 leading-loose">{label}</p>
  </EnhancedSectionCard>
);
