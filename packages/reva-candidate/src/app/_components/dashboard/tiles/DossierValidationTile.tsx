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
  isCaduque,
  canSubmitAgainAfterJury,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  activeDossierDeValidation: DossierDeValidationUseCandidateForDashboard;
  isCaduque: boolean;
  canSubmitAgainAfterJury: boolean;
}) => {
  const decision = activeDossierDeValidation?.decision;

  switch (true) {
    case isCaduque:
      return (
        <Badge severity="error" data-test="dossier-validation-badge-caduque">
          caduque
        </Badge>
      );

    case canSubmitAgainAfterJury:
      return (
        <Badge severity="error" data-test="dossier-validation-badge-to-send">
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
    case decision === "PENDING":
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
  isCaduque,
  jury,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  activeDossierDeValidation: DossierDeValidationUseCandidateForDashboard;
  isCaduque: boolean;
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
        (feasibility?.decision !== "ADMISSIBLE" && !canSubmitAgainAfterJury) ||
        isCaduque
      }
      start={
        <DossierValidationBadge
          activeDossierDeValidation={activeDossierDeValidation}
          isCaduque={isCaduque}
          feasibility={feasibility}
          canSubmitAgainAfterJury={canSubmitAgainAfterJury}
        />
      }
      title="Dossier de validation"
      small
      buttonProps={{
        onClick: () => {
          router.push("/dossier-de-validation");
        },
      }}
      imageUrl="/candidat/images/pictograms/binders.svg"
    />
  );
};
