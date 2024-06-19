import Tabs from "@codegouvfr/react-dsfr/Tabs";
import {
  DossierDeValidationFormData,
  DossierDeValidationTab,
} from "./DossierDeValidationTab";
import {
  ReadyForJuryEstimatedAtSchemaFormData,
  ReadyForJuryEstimatedDateTab,
} from "./ReadyForJuryEstimatedDateTab";

export const ReadyForJuryEstimatedAtAndDossierDeValidationTabs = ({
  readyForJuryEstimatedAt,
  onReadyForJuryEstimatedAtFormSubmit,
  onDossierDeValidationFormSubmit,
}: {
  readyForJuryEstimatedAt?: number | null;
  onReadyForJuryEstimatedAtFormSubmit(
    data: ReadyForJuryEstimatedAtSchemaFormData,
  ): Promise<void>;
  onDossierDeValidationFormSubmit(
    data: DossierDeValidationFormData,
  ): Promise<void>;
}) => {
  return (
    <Tabs
      tabs={[
        {
          label: "Date prévisionnelle",
          isDefault: !readyForJuryEstimatedAt,
          content: (
            <ReadyForJuryEstimatedDateTab
              readyForJuryEstimatedAt={readyForJuryEstimatedAt || undefined}
              onFormSubmit={onReadyForJuryEstimatedAtFormSubmit}
            />
          ),
        },
        {
          label: "Dossier",
          isDefault: !!readyForJuryEstimatedAt,
          content: (
            <DossierDeValidationTab
              onFormSubmit={onDossierDeValidationFormSubmit}
            />
          ),
        },
      ]}
    />
  );
};
