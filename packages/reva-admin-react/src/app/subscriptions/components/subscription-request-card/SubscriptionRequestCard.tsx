import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";

export const SubscriptionRequestCard = ({
  companyName,
  createdAt,
  onClick,
}: {
  companyName: string;
  createdAt: Date;
  onClick?: () => void;
}) => (
  <GrayCard>
    <strong>Raison sociale de la structure</strong>
    <p>{companyName}</p>
    <br />
    <strong>Date d'envoi de l'inscription</strong>
    <p>{format(createdAt, "d MMM yyyy")}</p>
    {onClick && (
      <Button className="ml-auto" onClick={onClick}>
        Voir plus
      </Button>
    )}
  </GrayCard>
);
