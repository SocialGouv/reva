import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { BackButton } from "@/components/back-button/BackButton";

import { EndAccompagnementStatus } from "@/graphql/generated/graphql";

import { useEndAccompagnement } from "../end-accompagnement.hook";

const getStatusLabel = (status: EndAccompagnementStatus | null | undefined) => {
  switch (status) {
    case "CONFIRMED_BY_CANDIDATE":
      return "Confirmé par le candidat";
    case "CONFIRMED_BY_ADMIN":
      return "Confirmé par France VAE";
    case "PENDING":
      return "Attente de la confirmation par le candidat";
    default:
      return "";
  }
};

export const EndAccompagnementReadOnly = () => {
  const { candidacy, candidacyId } = useEndAccompagnement();

  const endAccompagnementStatus = candidacy?.endAccompagnementStatus;
  const endAccompagnementDate = candidacy?.endAccompagnementDate;
  const statusLabel = getStatusLabel(endAccompagnementStatus);

  return (
    <>
      <div className="flex justify-between mb-4">
        <span>Date de fin d'accompagnement déclarée</span>
        <span className="font-bold">
          {endAccompagnementDate
            ? format(endAccompagnementDate, "dd/MM/yyyy")
            : ""}
        </span>
      </div>
      <hr className="pb-0.5" />
      <div className="flex justify-between my-4">
        <span>Statut</span>
        <span className="font-bold">{statusLabel}</span>
      </div>
      <hr className="pb-0.5" />
      <Alert
        severity="info"
        title=""
        description="Vous pensez avoir fait une erreur ? Contactez le support afin de résoudre le problème."
        small
        className="my-12"
      />
      <BackButton href={`/candidacies/${candidacyId}/summary`} hasIcon={false}>
        Retour
      </BackButton>
    </>
  );
};
