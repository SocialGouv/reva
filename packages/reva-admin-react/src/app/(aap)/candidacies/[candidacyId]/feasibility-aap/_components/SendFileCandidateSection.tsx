import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useSendFileCandidateSection } from "./sendFileCandidateSection.hook";
import { useParams } from "next/navigation";

export const SendFileCandidateSection = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { isDematerializedFeasibilityFileHasBeenSent } =
    useSendFileCandidateSection();
  return (
    <div>
      {isDematerializedFeasibilityFileHasBeenSent && (
        <Alert
          description="Vous avez fait de nouvelles modifications sur le dossier ou prévoyez d'en faire ? Veillez à bien renvoyer le dossier au candidat afin qu'il valide la nouvelle version."
          severity="success"
          title={`Dossier envoyé au candidat le ${format(isDematerializedFeasibilityFileHasBeenSent, "dd/MM/yyyy")}`}
        />
      )}
      <div className="flex justify-end">
        <Button
          linkProps={{
            href: `/candidacies/${candidacyId}/feasibility-aap/send-file-candidate`,
          }}
          priority={
            isDematerializedFeasibilityFileHasBeenSent ? "secondary" : "primary"
          }
        >
          {isDematerializedFeasibilityFileHasBeenSent
            ? "Voir le dossier"
            : "Vérifier et envoyer"}
        </Button>
      </div>
    </div>
  );
};
