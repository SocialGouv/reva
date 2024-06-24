import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams } from "next/navigation";

export const SendFileCandidateSection = ({
  sentToCandidateAt,
}: {
  sentToCandidateAt?: Date | null;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  return (
    <div>
      {sentToCandidateAt && (
        <Alert
          description="Vous avez fait de nouvelles modifications sur le dossier ou prévoyez d'en faire ? Veillez à bien renvoyer le dossier au candidat afin qu'il valide la nouvelle version."
          severity="success"
          title={`Dossier envoyé au candidat le ${format(sentToCandidateAt, "dd/MM/yyyy")}`}
          className="mb-6"
        />
      )}
      <div className="flex justify-end">
        <Button
          linkProps={{
            href: `/candidacies/${candidacyId}/feasibility-aap/send-file-candidate`,
          }}
          priority={sentToCandidateAt ? "secondary" : "primary"}
        >
          {sentToCandidateAt ? "Voir le dossier" : "Vérifier et envoyer"}
        </Button>
      </div>
    </div>
  );
};
