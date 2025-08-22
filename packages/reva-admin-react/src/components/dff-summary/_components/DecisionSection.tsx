import Badge from "@codegouvfr/react-dsfr/Badge";

import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";

import { DfFileAapDecision } from "@/graphql/generated/graphql";

export default function DecisionSection({
  decision,
  decisionComment,
}: {
  decision?: DfFileAapDecision | null;
  decisionComment?: string | null;
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

  return (
    <div>
      <div className="flex">
        <span className="fr-icon-thumb-up-fill fr-icon--lg mr-2" />
        <h2 className="mb-0">Avis de faisabilité</h2>
      </div>
      <div className="my-4">
        <DecisionBadge />
      </div>
      {decisionComment && <p>“{decisionComment}”</p>}
    </div>
  );
}
