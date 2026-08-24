import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { format, isValid } from "date-fns";

export const SubscriptionRequestCard = ({
  companyName,
  createdAt,
  createdAtLabel,
  href,
  isActive,
}: {
  companyName: string;
  createdAt?: Date;
  createdAtLabel: string;
  href: string;
  isActive?: boolean;
}) => (
  <li className="list-none">
    <Card
      size="small"
      enlargeLink
      linkProps={{ href }}
      start={
        isActive === false ? (
          <Badge severity="warning" small noIcon className="mb-2">
            Invisibilité forcée
          </Badge>
        ) : undefined
      }
      title={companyName}
      desc={
        createdAt && isValid(createdAt)
          ? `${createdAtLabel} : ${format(createdAt, "dd/MM/yyyy")}`
          : undefined
      }
    />
  </li>
);
