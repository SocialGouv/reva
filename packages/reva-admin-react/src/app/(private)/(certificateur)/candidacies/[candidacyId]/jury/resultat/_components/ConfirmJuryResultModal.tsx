"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { createModal } from "@codegouvfr/react-dsfr/Modal";

import { JuryResult } from "@/graphql/generated/graphql";

const juryResultLabels: { [key in JuryResult]: string } = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "Réussite totale",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "Réussite partielle",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "Réussite totale",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "Réussite partielle",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION:
    "Réussite partielle (sous reserve de confirmation par un certificateur)",
  FAILURE: "Non validation",
  CANDIDATE_EXCUSED: "Excusé sur justificatif",
  CANDIDATE_ABSENT: "Non présent le jour du jury",
};

const juryResultNotice: {
  [key in JuryResult]: "info" | "new" | "success" | "error";
} = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "info",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "info",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION: "info",
  FAILURE: "error",
  CANDIDATE_EXCUSED: "new",
  CANDIDATE_ABSENT: "new",
};

export const confirmResultModal = createModal({
  id: "confirm-result",
  isOpenedByDefault: false,
});

const JuryResultModalContent = ({
  result,
  candidate,
  certification,
}: {
  result: JuryResult;
  candidate: {
    firstName: string;
    lastName: string;
  };
  certification: {
    label: string;
  };
}) => {
  const consequence = (result: JuryResult) => {
    switch (result) {
      case "FULL_SUCCESS_OF_FULL_CERTIFICATION":
      case "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION":
        return "Le candidat a validé l'ensemble des blocs pour lesquels il est recevable. Son parcours de VAE est terminé pour cette candidature.";
      case "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION":
      case "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION":
      case "PARTIAL_SUCCESS_PENDING_CONFIRMATION":
        return "Le candidat a validé une partie des blocs pour lesquels il est recevable. Il pourra redéposer un dossier de validation pour les blocs restants.";
      case "FAILURE":
        return "Le candidat n'a validé aucun des blocs pour lesquels il est recevable. Il pourra redéposer un dossier de validation pour les blocs restants.";
      case "CANDIDATE_EXCUSED":
        return "Le candidat n'a validé aucun bloc. Il pourra redéposer un dossier de validation pour les blocs restants.";
      case "CANDIDATE_ABSENT":
        return "Le candidat n'a validé aucun bloc. Il pourra redéposer un dossier de validation pour les blocs restants.";
    }
  };

  return (
    <div>
      <p>Vous êtes sur le point de confirmer le résultat pour :</p>
      <ul>
        <li>
          Candidat : {candidate.firstName} {candidate.lastName}
        </li>
        <li>Diplôme : {certification.label}</li>
      </ul>
      <Badge severity={juryResultNotice[result]} className="mb-4">
        {juryResultLabels[result]}
      </Badge>
      <p>Conséquence : {consequence(result)}</p>
      <p>Confirmez-vous ce résultat ?</p>
    </div>
  );
};

type ConfirmJuryResultModalProps = {
  result: JuryResult;
  candidate: {
    firstName: string;
    lastName: string;
  };
  certification: {
    label: string;
  };
  onConfirm: () => void;
};

export const ConfirmJuryResultModal = ({
  result,
  candidate,
  certification,
  onConfirm,
}: ConfirmJuryResultModalProps) => (
  <confirmResultModal.Component
    title="Confirmer le résultat du jury"
    className="modal-confirm-jury-result"
    size="large"
    buttons={[
      {
        priority: "secondary",
        children: "Annuler",
      },
      {
        priority: "primary",
        onClick: onConfirm,
        children: "Confirmer",
      },
    ]}
  >
    <div className="flex flex-col gap-4">
      <JuryResultModalContent
        result={result}
        candidate={candidate}
        certification={certification}
      />
    </div>
  </confirmResultModal.Component>
);
