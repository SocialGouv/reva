import { Card } from "@codegouvfr/react-dsfr/Card";
import Tag from "@codegouvfr/react-dsfr/Tag";

export const SousCompteCard = ({
  firstname,
  lastname,
  onClickHref,
  canCreateCohorte,
}: {
  firstname: string;
  lastname: string;
  onClickHref: string;
  canCreateCohorte: boolean;
}) => (
  <Card
    start={
      canCreateCohorte ? (
        <Tag small iconId="ri-checkbox-circle-fill">
          Création de cohorte activée
        </Tag>
      ) : undefined
    }
    title={`${lastname} ${firstname}`}
    linkProps={{ href: onClickHref }}
    enlargeLink
  />
);
