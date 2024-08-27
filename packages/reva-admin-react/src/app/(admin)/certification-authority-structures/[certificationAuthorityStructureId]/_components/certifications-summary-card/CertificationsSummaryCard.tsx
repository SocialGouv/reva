import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { sortBy, sortedUniqBy } from "lodash";

type Certification = {
  id: string;
  domaines: Domaine[];
  conventionsCollectives: ConventionCollective[];
};
type Domaine = { id: string; label: string };
type ConventionCollective = { id: string; label: string };

export const CertificationsSummaryCard = ({
  certifications,
  updateButtonHref,
}: {
  certifications: Certification[];
  updateButtonHref?: string;
}) => {
  const certificationCount = certifications.length;
  const domaines = sortedUniqBy(
    sortBy(
      certifications.flatMap((c) => c.domaines),
      "label",
    ),
    "label",
  );
  const conventionCollectives = sortedUniqBy(
    sortBy(
      certifications.flatMap((c) => c.conventionsCollectives),
      "label",
    ),
    "label",
  );

  return (
    <EnhancedSectionCard
      title="Certifications gérées"
      titleIconClass="fr-icon-award-fill"
      isEditable={!!updateButtonHref}
      status={certificationCount ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={updateButtonHref || ""}
    >
      {certificationCount ? (
        <div className="flex flex-col gap-6">
          <Badge className="bg-[#FEE7FC] text-[#6E445A]">
            {certificationCount} certifications gérées
          </Badge>
        </div>
      ) : null}
      {domaines && (
        <>
          <p className="font-bold mt-6">Filières rattachées</p>
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <Tag key={d.id}>{d.label}</Tag>
            ))}
          </div>
        </>
      )}

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
