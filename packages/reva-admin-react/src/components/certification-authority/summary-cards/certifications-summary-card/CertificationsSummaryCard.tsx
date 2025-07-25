import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { sortBy, sortedUniqBy } from "lodash";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

type Certification = {
  id: string;
  conventionsCollectives: ConventionCollective[];
};
type ConventionCollective = { id: string; label: string };

export const CertificationsSummaryCard = ({
  certifications,
  updateButtonHref,
}: {
  certifications: Certification[];
  updateButtonHref?: string;
}) => {
  const certificationCount = certifications.length;

  const conventionCollectives = sortedUniqBy(
    sortBy(
      certifications.flatMap((c) => c.conventionsCollectives),
      "label",
    ),
    "label",
  );

  return (
    <EnhancedSectionCard
      data-test="certifications-summary-card"
      title="Certifications gérées"
      titleIconClass="fr-icon-award-fill"
      isEditable={!!updateButtonHref}
      status={certificationCount ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={updateButtonHref || ""}
    >
      {certificationCount ? (
        <div className="flex flex-col gap-6">
          <Badge
            className="bg-[#FEE7FC] text-[#6E445A]"
            data-test="certifications-count-badge"
          >
            {certificationCount} certifications gérées
          </Badge>
        </div>
      ) : null}

      {conventionCollectives && (
        <>
          <p className="font-bold mt-6">Conventions collectives rattachées</p>
          <div className="flex flex-wrap gap-2">
            {conventionCollectives.map((c) => (
              <Tag key={c.id}>{c.label}</Tag>
            ))}
          </div>
        </>
      )}
    </EnhancedSectionCard>
  );
};
