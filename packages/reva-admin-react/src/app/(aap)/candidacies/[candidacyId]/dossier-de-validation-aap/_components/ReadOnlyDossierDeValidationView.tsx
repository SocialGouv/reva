import { FileLink } from "@/app/(certificateur)/candidacies/(components)/FileLink";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

interface FileDesc {
  url: string;
  name: string;
}

export const ReadOnlyDossierDeValidationView = ({
  dossierDeValidationSentAt,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
}: {
  dossierDeValidationSentAt: Date;
  dossierDeValidationFile: FileDesc;
  dossierDeValidationOtherFiles: FileDesc[];
}) => {
  return (
    <div className="flex flex-col mt-6">
      <Alert
        severity="success"
        title="Dossier de validation envoyé"
        description="Le dossier de validation a été envoyé. Retrouvez ci-dessous les documents qui le composent."
      />
      <p className="mt-16">
        Dossier envoyé le : {format(dossierDeValidationSentAt, "dd/MM/yyyy")}
      </p>

      <h2 className="mt-4 text-lg">Contenu du dossier</h2>
      <ul className="flex flex-col gap-6">
        <GrayCard>
          <FileLink
            url={dossierDeValidationFile.url}
            text={dossierDeValidationFile.name}
          />
        </GrayCard>
        {dossierDeValidationOtherFiles.map((of) => (
          <GrayCard key={of.url}>
            <FileLink url={of.url} text={of.name} />
          </GrayCard>
        ))}
      </ul>
    </div>
  );
};
