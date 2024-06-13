import { useMemo } from "react";
import { format } from "date-fns";
import { GrayCard } from "../card/gray-card/GrayCard";

interface Props {
  history: FeasibilityDecision[];
}

export const FeasibilityDecisionHistory = (props: Props) => {
  const { history } = props;

  return (
    <div>
      <h5 className="text-2xl font-bold mb-2">
        {history.length === 1 ? "Décision précédente" : "Décisions précédentes"}
      </h5>

      <div className="gap-8">
        {history.map((previousFeasibility) => (
          <FeasibilityDecisionInfo
            key={previousFeasibility.id}
            id={previousFeasibility.id}
            decision={previousFeasibility.decision}
            decisionSentAt={previousFeasibility.decisionSentAt}
            decisionComment={previousFeasibility.decisionComment}
          />
        ))}
      </div>
    </div>
  );
};

interface FeasibilityDecision {
  id: string;
  decision: "ADMISSIBLE" | "REJECTED" | "INCOMPLETE" | "PENDING";
  decisionSentAt?: number | null | undefined;
  decisionComment?: string | null | undefined;
}

export const FeasibilityDecisionInfo = (
  feasibilityDecision: FeasibilityDecision,
) => {
  const { decision, decisionSentAt, decisionComment } = feasibilityDecision;

  const decisionLabel = useMemo(() => {
    switch (decision) {
      case "ADMISSIBLE":
        return "Recevable";
      case "REJECTED":
        return "Non recevable";
      case "INCOMPLETE":
        return "Dossier incomplet";
    }
  }, [decision]);

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
    <GrayCard className={`flex flex-col gap-4`}>
      {decisionSentAt && (
        <div>
          <h6 className="mb-1">{decisionLabel}</h6>
          <p className="mb-0">
            {decisionDateLabel} le {format(decisionSentAt, "d/MM/yyyy")}
          </p>
        </div>
      )}
      <div>
        <h6 className="mb-1">Motifs de la décision</h6>
        {decisionComment ? (
          <p className="mb-0">{decisionComment}</p>
        ) : (
          <p className="mb-0 italic">Motifs non précisés</p>
        )}
      </div>
    </GrayCard>
  );
};
