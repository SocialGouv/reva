import Badge from "@codegouvfr/react-dsfr/Badge";

export const CompleteIncompleteBadge = ({
  isComplete,
}: {
  isComplete: boolean;
}) => (
  <Badge
    severity={isComplete ? "success" : "warning"}
    data-testid={isComplete ? "complete-badge" : "incomplete-badge"}
  >
    {isComplete ? "complété" : "à compléter"}
  </Badge>
);
