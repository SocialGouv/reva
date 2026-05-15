import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

export const CertificationAuthorityLocalAccountCard = ({
  label,
  certificationAuthorityLabel,
  contactEmail,
  contactPhone,
}: {
  label: string;
  certificationAuthorityLabel: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}) => (
  <Card
    data-testid="certification-authority-local-account-card"
    classes={{ end: "hidden" }}
    start={
      <span className="flex flex-col gap-2 mb-3">
        <Tag small className="mb-1">
          Compte local
        </Tag>
        <span className="fr-icon-arrow-right-line fr-icon--sm text-dsfrGray-mentionGrey text-xs">
          {"  "}
          {certificationAuthorityLabel}
        </span>
      </span>
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
