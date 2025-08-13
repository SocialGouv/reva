import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { FancyPreview } from "@/components/fancy-preview/FancyPreview";

interface FilePreview {
  name: string;
  previewUrl?: string | null;
}

export const ReadOnlyDossierDeValidationTab = ({
  dossierDeValidationSentAt,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
}: {
  dossierDeValidationSentAt?: Date;
  dossierDeValidationFile?: FilePreview;
  dossierDeValidationOtherFiles: FilePreview[];
}) => {
  return (
    <div className="flex flex-col">
      <Alert
        data-test="dossier-de-validation-sent-alert"
        title={`Dossier de validation envoyé au certificateur le ${dossierDeValidationSentAt ? format(dossierDeValidationSentAt, "dd/MM/yyyy") : ""}`}
        severity="success"
        className="mt-8"
        description="Le contenu reste consultable. Si vous souhaitez le modifier, contactez votre certificateur : lui seul peut rouvrir l’envoi du dossier de validation avant le passage en jury"
      />

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
