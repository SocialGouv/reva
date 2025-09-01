import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { FancyPreview } from "@/components/fancy-preview/FancyPreview";

import { ResourcesSection } from "../../ResourcesSection";

interface FilePreview {
  name: string;
  previewUrl?: string | null;
}

interface Certification {
  id: string;
  label: string;
  additionalInfo?: {
    dossierDeValidationTemplate?: {
      previewUrl?: string | null;
    } | null;
    dossierDeValidationLink?: string | null;
  } | null;
}

export const ReadOnlyDossierDeValidationTab = ({
  dossierDeValidationSentAt,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
  certification,
}: {
  dossierDeValidationSentAt?: Date;
  dossierDeValidationFile?: FilePreview;
  dossierDeValidationOtherFiles: FilePreview[];
  certification: Certification | null;
}) => {
  return (
    <div className="flex gap-6">
      <main className="flex-1">
        <Alert
          data-test="dossier-de-validation-sent-alert"
          title={`Dossier de validation envoyé au certificateur le ${dossierDeValidationSentAt ? format(dossierDeValidationSentAt, "dd/MM/yyyy") : ""}`}
          severity="success"
          className="mt-8"
          description="Le contenu reste consultable. Si vous souhaitez le modifier, contactez votre certificateur : lui seul peut rouvrir l'envoi du dossier de validation avant le passage en jury"
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
      </main>

      <ResourcesSection certification={certification} />
    </div>
  );
};
