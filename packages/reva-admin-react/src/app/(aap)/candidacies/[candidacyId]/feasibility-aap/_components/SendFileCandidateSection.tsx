import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";

export const SendFileCandidateSection = ({
  hasBeenSentToCertificationAuthority,
  sentToCandidateAt,
  isReadyToBeSentToCandidate,
}: {
  hasBeenSentToCertificationAuthority: boolean;
  sentToCandidateAt?: Date | null;
  isReadyToBeSentToCandidate?: boolean;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  return (
    <div data-test="send-file-candidate-section">
      {sentToCandidateAt && (
        <Alert
          description="Vous avez fait de nouvelles modifications sur le dossier ou prévoyez d'en faire ? Veillez à bien renvoyer le dossier au candidat afin qu'il valide la nouvelle version."
          severity="success"
          title={`Dossier envoyé au candidat le ${format(sentToCandidateAt, "dd/MM/yyyy")}`}
          className="mb-6"
          data-test="sent-file-alert"
        />
      )}
      {!hasBeenSentToCertificationAuthority && (
        <div className="flex justify-end">
          <Button
            disabled={!isReadyToBeSentToCandidate}
            priority={sentToCandidateAt ? "secondary" : "primary"}
            onClick={() => {
              router.push(
                `/candidacies/${candidacyId}/feasibility-aap/send-file-candidate`,
              );
            }}
          >
            {sentToCandidateAt ? "Voir le dossier" : "Vérifier et envoyer"}
          </Button>
        </div>
      )}
    </div>
  );
};
