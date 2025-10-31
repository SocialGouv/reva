import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { FeasibilityDecisionHistory } from "@/components/feasibility-decision-history/FeasibilityDecisionHistory";

import { FeasibilityHistory } from "@/graphql/generated/graphql";

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
    <div className="mb-12 mt-6" data-testid="decision-incomplete-alert">
      <Alert
        title={`Dossier déclaré incomplet le ${format(decisionSentAt, "dd/MM/yyyy")}`}
        severity="warning"
        description={
          <div className="flex flex-col gap-2">
            {decisionComment && <p>”{decisionComment}”</p>}
            <p className="font-bold">
              Corrigez les éléments signalés par le certificateur et renvoyez le
              dossier pour validation à votre candidat afin de pouvoir le
              renvoyer compléter au certificateur.
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
