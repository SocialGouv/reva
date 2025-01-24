import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

export const BannerCaduciteConfirmed = ({
  dateSinceCandidacyIsCaduque,
}: {
  dateSinceCandidacyIsCaduque: Date;
}) => (
  <Alert
    title={`Recevabilité caduque depuis le ${format(
      dateSinceCandidacyIsCaduque,
      "dd/MM/yyyy",
    )}`}
    severity="error"
    description="Le candidat n'a pas procédé à son actualisation (démarche à effectuer tous les 6 mois). Sa recevabilité est donc caduque."
    className="mb-6"
    data-test="banner-caducite-confirmed"
  />
);
