import Badge from "@codegouvfr/react-dsfr/Badge";
import Input from "@codegouvfr/react-dsfr/Input";

import { DfFileAapDecision } from "@/graphql/generated/graphql";

import { CustomErrorBadge } from "../../CustomErrorBadge/CustomErrorBadge";

export default function DecisionSection({
  decision,
  decisionComment,
  candidateDecisionComment,
  setCandidateDecisionComment,
  candidateDecisionCommentDisabled,
}: {
  decision?: DfFileAapDecision | null;
  decisionComment?: string | null;
  candidateDecisionComment: string;
  setCandidateDecisionComment: (comment: string) => void;
  candidateDecisionCommentDisabled: boolean;
}) {
  const DecisionBadge = () => {
    if (decision === "FAVORABLE") {
      return (
        <Badge severity="success" noIcon>
          Favorable
        </Badge>
      );
    }
    return <CustomErrorBadge label="Non favorable" />;
  };

  if (!decision) {
    return null;
  }

  const isDecisionUnfavorable = decision === "UNFAVORABLE";

  return (
    <div>
      <div className="flex">
        <span className="fr-icon-thumb-up-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">L&apos;avis de mon accompagnateur </h2>
      </div>
      <div className="my-4">
        <DecisionBadge />
      </div>
      {decisionComment && <p>“{decisionComment}”</p>}
      {isDecisionUnfavorable && (
        <Input
          className="mt-4 mb-8"
          textArea
          label="Commentaire (optionnel)"
          hintText="Vous pouvez fournir des arguments pour contester cet avis. Ce message sera visible par le certificateur et l’accompagnateur."
          nativeTextAreaProps={{
            value: candidateDecisionComment,
            onChange: (e) => setCandidateDecisionComment?.(e.target.value),
            maxLength: 2000,
          }}
          disabled={candidateDecisionCommentDisabled}
        />
      )}
    </div>
  );
}
