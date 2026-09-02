import { Card } from "@codegouvfr/react-dsfr/Card";

export const SousCompteCard = ({
  firstname,
  lastname,
  onClickHref,
}: {
  firstname: string;
  lastname: string;
  onClickHref: string;
}) => (
  <Card
    title={`${firstname} ${lastname}`}
    linkProps={{ href: onClickHref }}
    enlargeLink
  />
);
