import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { format } from "date-fns";
import { useMemo } from "react";

interface Props {
  history: FeasibilityDecision[];
}

export const FeasibilityDecisionHistory = (props: Props) => {
  const { history } = props;

  if (!history?.length) return null;

  return (
    <Accordion label="Décisions précédentes" className="mb-8">
      {history.map((previousFeasibility) => (
        <FeasibilityDecisionInfo
          key={previousFeasibility.id}
          id={previousFeasibility.id}
          decision={previousFeasibility.decision}
          decisionSentAt={previousFeasibility.decisionSentAt}
          decisionComment={previousFeasibility.decisionComment}
        />
      ))}
    </Accordion>
  );
};

interface FeasibilityDecision {
  id: string;
  decision:
    | "ADMISSIBLE"
    | "COMPLETE"
    | "REJECTED"
    | "INCOMPLETE"
    | "PENDING"
    | "DRAFT";
  decisionSentAt?: number | null | undefined;
  decisionComment?: string | null | undefined;
}

export const FeasibilityDecisionInfo = (
  feasibilityDecision: FeasibilityDecision,
) => {
  const { decision, decisionSentAt, decisionComment } = feasibilityDecision;

  const decisionDateLabel = useMemo(() => {
    switch (decision) {
      case "ADMISSIBLE":
        return "Dossier validé";
      case "REJECTED":
        return "Dossier rejeté";
      case "INCOMPLETE":
        return "Dossier marqué incomplet";
    }
  }, [decision]);

  return (
    decisionSentAt && (
      <div className="border-b border-dsfrGray-200 mb-6 pb-4 last:border-none last:mb-0">
        <h6 className="mb-4">
          {decisionDateLabel} le {format(decisionSentAt, "d/MM/yyyy")}
        </h6>
        <h6 className="mb-2">Motif transmis par le certificateur</h6>
        <p className="mb-0">{decisionComment}</p>
      </div>
    )
  );
};
