import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";
import {
  FeasibilityUseCandidateForDashboard,
  DossierDeValidationUseCandidateForDashboard,
} from "../dashboard.hooks";
import Badge from "@codegouvfr/react-dsfr/Badge";

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
      return <Badge severity="error">caduque</Badge>;
    case (!activeDossierDeValidation || decision === "INCOMPLETE") &&
      feasibility?.decision === "ADMISSIBLE":
      return <Badge severity="warning">à transmettre</Badge>;
    case decision === "PENDING":
      return <Badge severity="success">envoyé au certificateur</Badge>;
    case decision === "INCOMPLETE":
      return <Badge severity="warning">incomplet</Badge>;
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
