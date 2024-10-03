import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { format } from "date-fns";

interface FilePreview {
  name: string;
  previewUrl?: string | null;
}

export const ReadOnlyDossierDeValidationTab = ({
  certificationAuthorityInfo,
  dossierDeValidationSentAt,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
}: {
  certificationAuthorityInfo: { name: string; email: string };
  dossierDeValidationSentAt?: Date;
  dossierDeValidationFile?: FilePreview;
  dossierDeValidationOtherFiles: FilePreview[];
}) => {
  return (
    <div className="flex flex-col">
      <Alert
        title={`Dossier de validation envoyé le ${dossierDeValidationSentAt ? format(dossierDeValidationSentAt, "dd/MM/yyyy") : ""}`}
        severity="info"
        className="mt-8"
        description="Votre dossier a bien été envoyé au certificateur. En attendant le retour de votre certificateur, le contenu du dossier reste consultable."
      />

      <CallOut title="Comment contacter mon certificateur ?" className="mt-8">
        <div className="mt-2">{certificationAuthorityInfo.name}</div>
        <div>{certificationAuthorityInfo.email}</div>
      </CallOut>

      <h2>Contenu du dossier</h2>
      {dossierDeValidationFile && (
        <FancyPreview
          defaultDisplay={false}
          title={dossierDeValidationFile.name}
          name={dossierDeValidationFile?.name}
          src={dossierDeValidationFile.previewUrl || ""}
        />
      )}
      {dossierDeValidationOtherFiles.map((of) => (
        <FancyPreview
          key={of.previewUrl}
          defaultDisplay={false}
          title={of.name}
          name={of?.name}
          src={of.previewUrl || ""}
        />
      ))}
    </div>
  );
};
