import { Button } from "@codegouvfr/react-dsfr/Button";

export const SelectCertificationButton = ({
  certificationId,
}: {
  certificationId: string;
}) => (
  <Button
    priority="primary"
    linkProps={{
      href: `/inscription-candidat/?certificationId=${certificationId}`,
    }}
  >
    Choisir ce diplôme
  </Button>
);
