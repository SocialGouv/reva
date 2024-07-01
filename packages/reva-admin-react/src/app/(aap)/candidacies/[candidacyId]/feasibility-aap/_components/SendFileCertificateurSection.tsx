import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";

export const SendFileCertificationAuthoritySection = ({
  sentToCertificationAuthorityAt,
  isReadyToBeSentToCertificationAuthority,
}: {
  sentToCertificationAuthorityAt?: Date | null;
  isReadyToBeSentToCertificationAuthority?: boolean;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  return (
    <div>
      <h2 className="mt-0">Vérifier et envoyer le dossier au certificateur </h2>
      {sentToCertificationAuthorityAt && (
        <Alert
          severity="success"
          title={`Dossier envoyé au certificateur le ${format(sentToCertificationAuthorityAt, "dd/MM/yyyy")}`}
          className="mb-6"
        />
      )}
      <div className="flex justify-end">
        <Button
          disabled={!isReadyToBeSentToCertificationAuthority}
          priority={sentToCertificationAuthorityAt ? "secondary" : "primary"}
          onClick={() => {
            router.push(
              `/candidacies/${candidacyId}/feasibility-aap/send-file-certification-authority`,
            );
          }}
        >
          {sentToCertificationAuthorityAt
            ? "Voir le dossier"
            : "Vérifier et envoyer"}
        </Button>
      </div>
    </div>
  );
};
