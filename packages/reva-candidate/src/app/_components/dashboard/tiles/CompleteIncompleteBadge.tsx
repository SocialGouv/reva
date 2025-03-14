import Badge from "@codegouvfr/react-dsfr/Badge";

export const CompleteIncompleteBadge = ({
  isComplete,
}: {
  isComplete: boolean;
}) => (
  <Badge severity={isComplete ? "success" : "warning"}>
    {isComplete ? "complété" : "à compléter"}
  </Badge>
);
