import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import {
  DossierDeValidationUseCandidateForDashboard,
  FeasibilityUseCandidateForDashboard,
  JuryUseCandidateForDashboard,
} from "../dashboard.hooks";

const DossierValidationBadge = ({
  feasibility,
  activeDossierDeValidation,
  canSubmitAgainAfterJury,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  activeDossierDeValidation: DossierDeValidationUseCandidateForDashboard;
  canSubmitAgainAfterJury: boolean;
}) => {
  const decision = activeDossierDeValidation?.decision;

  switch (true) {
    case canSubmitAgainAfterJury:
      return (
        <Badge severity="warning" data-test="dossier-validation-badge-to-send">
          à transmettre
        </Badge>
      );

    case (!activeDossierDeValidation || decision === "INCOMPLETE") &&
      feasibility?.decision === "ADMISSIBLE":
      return (
        <Badge severity="warning" data-test="dossier-validation-badge-to-send">
          à transmettre
        </Badge>
      );
    case decision === "PENDING" || decision === "COMPLETE":
      return (
        <Badge severity="success" data-test="dossier-validation-badge-pending">
          envoyé au certificateur
        </Badge>
      );
    case decision === "INCOMPLETE":
      return (
        <Badge
          severity="warning"
          data-test="dossier-validation-badge-incomplete"
        >
          incomplet
        </Badge>
      );
    default:
      return null;
  }
};

export const DossierValidationTile = ({
  feasibility,
  activeDossierDeValidation,
  jury,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  activeDossierDeValidation: DossierDeValidationUseCandidateForDashboard;
  jury: JuryUseCandidateForDashboard;
}) => {
  const router = useRouter();

  // When the candidacy has a failed jury result,
  // the user can submit another dossier de validation
  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  const canSubmitAgainAfterJury = failedJuryResults.includes(
    jury?.result || "",
  );

  return (
    <Tile
      data-test="dossier-validation-tile"
      disabled={
        feasibility?.decision !== "ADMISSIBLE" && !canSubmitAgainAfterJury
      }
      start={
        <DossierValidationBadge
          activeDossierDeValidation={activeDossierDeValidation}
          feasibility={feasibility}
          canSubmitAgainAfterJury={canSubmitAgainAfterJury}
        />
      }
      title="Dossier de validation"
      small
      buttonProps={{
        onClick: () => {
          router.push("./dossier-de-validation");
        },
      }}
      imageUrl="/candidat/images/pictograms/binders.svg"
    />
  );
};
