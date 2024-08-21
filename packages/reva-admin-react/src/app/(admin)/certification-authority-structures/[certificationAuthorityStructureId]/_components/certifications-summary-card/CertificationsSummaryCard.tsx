import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useMemo } from "react";

type Domaine = { id: string; label: string };
type Certification = {
  id: string;
  label: string;
  codeRncp: string;
  domaines: Domaine[];
};

export const CertificationsSummaryCard = ({
  certifications,
  updateButtonHref,
}: {
  certifications: Certification[];
  updateButtonHref: string;
}) => {
  const domainsAndCertifications = useMemo(
    () =>
      certifications?.reduce(
        (acc, curr) => {
          if (acc[curr.domaines[0].id]) {
            acc[curr.domaines[0].id] = [...acc[curr.domaines[0].id], curr];
          } else {
            acc[curr.domaines[0].id] = [curr];
          }
          return acc;
        },
        {} as Record<string, Certification[]>,
      ),
    [certifications],
  );

  return (
    <DefaultCandidacySectionCard
      title="Certifications gérées"
      titleIconClass="fr-icon-award-fill"
      isEditable
      status={certifications.length ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={updateButtonHref}
    >
      {certifications.length ? (
        <div className="flex flex-col gap-6">
          <Badge className="bg-[#FEE7FC] text-[#6E445A]">
            {certifications.length} certifications gérées
          </Badge>
        </div>
      ) : null}
      <p className="font-bold mt-6">Domaines rattachés</p>
      {Object.entries(domainsAndCertifications).map(([domainId, certs]) => (
        <Accordion label={certs[0].domaines[0].label} key={domainId}>
          <div className="flex flex-wrap gap-2">
            {certs.map((c) => (
              <Tag key={c.id}>
                {c.codeRncp} - {c.label}
              </Tag>
            ))}
          </div>
        </Accordion>
      ))}
    </DefaultCandidacySectionCard>
  );
};
