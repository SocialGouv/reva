import { format } from "date-fns";

export const SubscriptionRequestCard = ({
  companyName,
  createdAt,
}: {
  companyName: string;
  createdAt: Date;
}) => (
  <li className="bg-neutral-100 hover:bg-gray-50 p-6 flex flex-col">
    <strong>Raison sociale de la structure</strong>
    <p>{companyName}</p>
    <br />
    <strong>Date d'envoi de l'inscription</strong>
    <p>{format(createdAt, "d MMM yyyy")}</p>
  </li>
);
