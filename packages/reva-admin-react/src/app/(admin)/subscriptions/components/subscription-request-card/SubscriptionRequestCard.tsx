import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";

export const SubscriptionRequestCard = ({
  companyName,
  createdAt,
  createdAtLabel,
  href,
}: {
  companyName: string;
  createdAt: Date;
  createdAtLabel: string;
  href?: string;
}) => (
  <GrayCard>
    <strong>Raison sociale de la structure</strong>
    <p>{companyName}</p>
    <strong>{createdAtLabel}</strong>
    <p className="mb-0">{format(createdAt, "d MMM yyyy")}</p>
    {href && (
      <Button className="ml-auto" linkProps={{ href }}>
        Voir plus
      </Button>
    )}
  </GrayCard>
);
