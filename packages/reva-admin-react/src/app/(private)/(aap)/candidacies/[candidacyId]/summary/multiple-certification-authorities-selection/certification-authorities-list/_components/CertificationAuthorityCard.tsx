import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const CertificationAuthorityCard = ({
  label,
  contactEmail,
  contactPhone,
  onClickHref,
}: {
  label: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  onClickHref: string;
}) => (
  <Card
    data-testid="certification-authority-card"
    start={
      <Tag small className="mb-3">
        Gestionnaire de candidatures
      </Tag>
    }
    title={label}
    desc={
      <span className="flex flex-col gap-1">
        {contactEmail && <span>{contactEmail}</span>}
        {contactPhone && <span>{contactPhone}</span>}
      </span>
    }
    endDetail="Choisir"
    enlargeLink
    linkProps={{ href: onClickHref }}
  />
);
