import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Tag from "@codegouvfr/react-dsfr/Tag";

export default function InterventionAreaSummaryCard({
  regions,
  updateButtonHref,
}: {
  regions: {
    id: string;
    label: string;
    departments: {
      id: string;
      label: string;
      code: string;
    }[];
  }[];
  updateButtonHref?: string;
}) {
  const isInterventionAreaComplete = regions.length > 0;
  return (
    <EnhancedSectionCard
      title="Zone d'intervention"
      titleIconClass="fr-icon-road-map-fill"
      isEditable={!!updateButtonHref}
      buttonOnClickHref={updateButtonHref || ""}
      status={isInterventionAreaComplete ? "COMPLETED" : "TO_COMPLETE"}
    >
      {regions.map((r) => (
        <Accordion label={r.label} key={r.id}>
          <div className="flex flex-wrap gap-2">
            {r.departments.map((d) => (
              <Tag key={d.id}>
                {d.label} ({d.code})
              </Tag>
            ))}
          </div>
        </Accordion>
      ))}
    </EnhancedSectionCard>
  );
}
