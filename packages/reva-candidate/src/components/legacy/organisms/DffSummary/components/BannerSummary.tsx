import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

export function BannerSummary({
  feasibilitySentToCertificationAuthorityAt,
}: {
  feasibilitySentToCertificationAuthorityAt?: number | null;
}) {
  if (feasibilitySentToCertificationAuthorityAt) {
    return (
      <Alert
        description={`Dossier envoyé au certificateur le ${format(
          feasibilitySentToCertificationAuthorityAt,
          "dd/MM/yyyy",
        )}`}
        severity="success"
        title=""
      />
    );
  }

  return (
    <p className="text-xl">
      Vous avez en partie rempli ce dossier avec votre accompagnateur. Vérifiez
      les informations puis validez votre dossier en envoyant une attestation
      sur l'honneur à votre accompagnateur. Il se chargera ensuite de le
      transmettre au certificateur qui se prononcera sur la recevabilité.
    </p>
  );
}
