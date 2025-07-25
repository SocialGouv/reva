import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const CertificationCard = ({
  certification,
  commanditaireId,
  cohorteVaeCollectiveId,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  certification: {
    id: string;
    label: string;
    codeRncp: string;
    domains: {
      children: {
        id: string;
        label: string;
      }[];
    }[];
  };
}) => (
  <Card
    data-testid="certification-card"
    title={certification.label}
    size="small"
    start={
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {certification.domains.flatMap((d) =>
            d.children.map((sd) => (
              <Tag
                key={sd.id}
                small
                className="text-dsfr-light-text-label-grey"
              >
                {sd.label}
              </Tag>
            )),
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-dsfr-light-text-mention-grey">
          <span className="ri-verified-badge-line fr-icon--sm" />
          RNCP {certification.codeRncp}
        </div>
      </div>
    }
    enlargeLink
    linkProps={{
      href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications/${certification.id}`,
    }}
  />
);
