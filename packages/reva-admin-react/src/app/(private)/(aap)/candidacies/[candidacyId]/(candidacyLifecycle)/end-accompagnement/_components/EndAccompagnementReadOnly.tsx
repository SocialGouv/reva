import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { BackButton } from "@/components/back-button/BackButton";

import {
  EndAccompagnementReason,
  EndAccompagnementStatus,
} from "@/graphql/generated/graphql";

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

const getEndAccompagnementReasonLabel = (reason: EndAccompagnementReason) => {
  switch (reason) {
    case "CONTRAT_ACCOMPAGNEMENT_TERMINE":
      return "Le contrat d’accompagnement est terminé";
    case "CHOIX_CANDIDAT":
      return "Choix du candidat de mettre fin à l’accompagnement (ex : nouvel accompagnateur, parcours en autonomie)";
    case "CHOIX_AAP":
      return "Décision de l’AAP de mettre fin à l’accompagnement (ex : non respect des CGV par le candidat)";
    case "ABANDON_OU_NON_REPONSE_CANDIDAT":
      return "Abandon du candidat ou non-réponse du candidat après 3 relances";
    case "FERMETURE_STRUCTURE":
      return "Fermeture de la structure (ex : liquidation)";
    case "AUCUN_ACCOMPAGNEMENT_CONTRACTUALISE":
      return "Aucun accompagnement n'a été contractualisé (ex : le candidat ne souhaite finalement pas que vous l'accompagniez)";
    default:
      return "";
  }
};

export const EndAccompagnementReadOnly = () => {
  const { candidacy, candidacyId } = useEndAccompagnement();

  const endAccompagnementStatus = candidacy?.endAccompagnementStatus;
  const endAccompagnementDate = candidacy?.endAccompagnementDate;
  const endAccompagnementReason = candidacy?.endAccompagnementReason;
  const endAccompagnementCandidateDropOutReasonLabel =
    candidacy?.endAccompagnementCandidateDropOutReason?.label;
  const statusLabel = getStatusLabel(endAccompagnementStatus);

  return (
    <>
      <div className="flex justify-between py-2 px-4 border-t">
        <span>Date de fin d'accompagnement déclarée</span>
        <span className="font-bold">
          {endAccompagnementDate
            ? format(endAccompagnementDate, "dd/MM/yyyy")
            : ""}
        </span>
      </div>
      {endAccompagnementReason && (
        <div className="flex justify-between py-2 px-4 border-t">
          <span>Motif de la fin d'accompagnement</span>
          <span className="font-bold text-right">
            {getEndAccompagnementReasonLabel(endAccompagnementReason)}
          </span>
        </div>
      )}
      <div className="flex justify-between py-2 px-4 border-t border-b">
        <span>Statut</span>
        <span className="font-bold">{statusLabel}</span>
      </div>

      {endAccompagnementCandidateDropOutReasonLabel && (
        <div className="mt-6">
          <div className="py-2 px-4">Abandon de la candidature signalé</div>
          <div className="flex justify-between py-2 px-4 border-t border-b">
            <span>Motif de l'abandon</span>
            <span className="font-bold text-right">
              {endAccompagnementCandidateDropOutReasonLabel}
            </span>
          </div>
        </div>
      )}

      <Alert
        severity="info"
        title=""
        description="Vous pensez avoir fait une erreur ? Contactez le support afin de résoudre le problème."
        small
        className="mt-6 mb-12"
      />
      <BackButton href={`/candidacies/${candidacyId}/summary`} hasIcon={false}>
        Retour
      </BackButton>
    </>
  );
};
