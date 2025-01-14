import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { DossierDeValidationCard } from "./DossierDeValidationCard";
import { DossierDeValidationType } from "../types";

interface Props {
  historyDossierDeValidation: DossierDeValidationType[];
}

export const HistoryDossierDeValidationView = (props: Props) => {
  const { historyDossierDeValidation } = props;

  if (historyDossierDeValidation.length == 0) return null;

  return (
    <Accordion label="Voir les précédents dossiers de validation">
      <div className="flex flex-col gap-6">
        {historyDossierDeValidation.map((dossierDeValidation) => (
          <div key={dossierDeValidation.id}>
            <DossierDeValidationCard
              dossierDeValidation={dossierDeValidation}
            />
          </div>
        ))}
      </div>
    </Accordion>
  );
};
