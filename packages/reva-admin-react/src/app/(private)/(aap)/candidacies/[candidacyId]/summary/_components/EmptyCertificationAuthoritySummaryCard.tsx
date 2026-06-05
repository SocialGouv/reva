import { Badge } from "@codegouvfr/react-dsfr/Badge";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export const EmptyCertificationAuthoritySummaryCard = () => (
  <EnhancedSectionCard
    title="Certificateur"
    isEditable
    CustomBadge={<Badge severity="error">Aucun certificateur</Badge>}
    data-testid="empty-certification-authority-summary-card"
  >
    <p className="mb-0 mr-6">
      Actuellement, aucun certificateur ne prend cette certification en charge.
      Pour que cette candidature puisse aboutir, contactez le support et
      informez-les de la situation.
    </p>
  </EnhancedSectionCard>
);
