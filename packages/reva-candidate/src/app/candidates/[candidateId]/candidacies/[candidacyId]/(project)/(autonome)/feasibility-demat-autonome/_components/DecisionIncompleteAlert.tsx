import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { FeasibilityHistory } from "@/graphql/generated/graphql";

import { FeasibilityDecisionHistory } from "./FeasibilityDecisionHistory";

export const DecisionIncompleteAlert = ({
  decisionSentAt,
  decisionComment,
  history,
}: {
  decisionSentAt: number;
  decisionComment: string;
  history: FeasibilityHistory[];
}) => {
  return (
    <div className="mb-12" data-testid="decision-incomplete-alert">
      <Alert
        title={`Dossier déclaré incomplet le ${format(decisionSentAt, "dd/MM/yyyy")}`}
        severity="warning"
        description={
          <div className="flex flex-col gap-2">
            {decisionComment && <p>”{decisionComment}”</p>}
            <p className="font-bold">
              Corrigez les éléments signalés par le certificateur et renvoyez le
              dossier au certificateur.
            </p>
          </div>
        }
      />

      {history.length > 1 && (
        <FeasibilityDecisionHistory
          label="Décisions précédentes"
          decisions={history}
          className="mt-12"
        />
      )}
    </div>
  );
};
