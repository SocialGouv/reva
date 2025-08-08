import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export function BannerSummary() {
  const { feasibility } = useCandidacy();
  const sentToCertificationAuthorityAt = feasibility?.feasibilityFileSentAt;

  if (sentToCertificationAuthorityAt) {
    return (
      <Alert
        description={`Dossier envoyé au certificateur le ${format(
          sentToCertificationAuthorityAt,
          "dd/MM/yyyy",
        )}`}
        severity="success"
        title=""
        className="mb-12"
      />
    );
  }

  return (
    <p className="text-xl mb-12">
      Vous avez en partie rempli ce dossier avec votre accompagnateur. Vérifiez
      les informations puis validez votre dossier en envoyant une attestation
      sur l'honneur à votre accompagnateur. Il se chargera ensuite de le
      transmettre au certificateur qui se prononcera sur la recevabilité.
    </p>
  );
}
