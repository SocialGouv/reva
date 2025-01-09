import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

export const BannerIsCaduque = ({
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
    description="Ce candidat ne s'est pas actualisé (démarche à effectuer tous les 6 mois). Sa recevabilité est désormais caduque. S'il le souhaite, il peut envoyer une contestation au certificateur depuis son espace."
    className="mb-6"
  />
);
