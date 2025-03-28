import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";
import {
  DossierDeValidationUseCandidateForDashboard,
  FeasibilityUseCandidateForDashboard,
} from "../dashboard.hooks";

const DossierValidationBadge = ({
  feasibility,
  activeDossierDeValidation,
  isCaduque,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  activeDossierDeValidation: DossierDeValidationUseCandidateForDashboard;
  isCaduque: boolean;
}) => {
  const decision = activeDossierDeValidation?.decision;

  switch (true) {
    case isCaduque:
      return (
        <Badge severity="error" data-test="dossier-validation-badge-caduque">
          caduque
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
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  activeDossierDeValidation: DossierDeValidationUseCandidateForDashboard;
  isCaduque: boolean;
}) => {
  const router = useRouter();
  return (
    <Tile
      data-test="dossier-validation-tile"
      disabled={feasibility?.decision !== "ADMISSIBLE" || isCaduque}
      start={
        <DossierValidationBadge
          activeDossierDeValidation={activeDossierDeValidation}
          isCaduque={isCaduque}
          feasibility={feasibility}
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
