import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const CertificationAuthorityCard = ({
  label,
  contactEmail,
  contactPhone,
}: {
  label: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}) => (
  <Card
    data-testid="certification-authority-card"
    classes={{ end: "hidden" }}
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
  />
);
