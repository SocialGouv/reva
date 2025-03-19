import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import { CertificationAuthorityInfoCallout } from "../../certification-authority-info-callout/CertificationAuthorityInfoCallout";

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
  certificationAuthorityInfo: { name: string; email: string; label: string };
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
        description="Le contenu du dossier reste accessible, si vous souhaitez le consulter."
      />

      <CertificationAuthorityInfoCallout {...certificationAuthorityInfo} />

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
