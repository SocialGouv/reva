import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FeasibilityUseCandidateForDashboard } from "../dashboard.hooks";
const FeasibilityBadge = ({
  feasibility,
  isCaduque,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  isCaduque: boolean;
}) => {
  const decision = feasibility?.decision;
  const isDfDemat = feasibility?.feasibilityFormat === "DEMATERIALIZED";
  const isSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;
  const isCandidateConfirmed =
    !!feasibility?.dematerializedFeasibilityFile?.candidateConfirmationAt;
  const decisionIsDraft = decision === "DRAFT";

  switch (true) {
    case isCaduque:
      return <Badge severity="error">caduque</Badge>;
    case decisionIsDraft &&
      isDfDemat &&
      isSentToCandidate &&
      !isCandidateConfirmed:
      return <Badge severity="warning">à valider</Badge>;
    case decisionIsDraft && isDfDemat:
      return <Badge severity="info">en cours</Badge>;
    case decisionIsDraft:
      return <Badge severity="info">à envoyer au certificateur</Badge>;
    case decision === "ADMISSIBLE":
      return <Badge severity="success">recevable</Badge>;
    case decision === "INCOMPLETE":
      return <Badge severity="warning">incomplet</Badge>;
    case decision === "COMPLETE":
      return <Badge severity="info">complet</Badge>;
    case decision === "PENDING":
      return <Badge severity="info">envoyé au certificateur</Badge>;
    case decision === "REJECTED":
      return <Badge severity="error">non recevable</Badge>;
    default:
      return null;
  }
};

export const FeasibilityTile = ({
  feasibility,
  isCaduque,
  candidacyIsAutonome,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  isCaduque: boolean;
  candidacyIsAutonome: boolean;
}) => {
  const router = useRouter();
  const isFeasibilityDemat =
    feasibility?.feasibilityFormat === "DEMATERIALIZED";
  const feasibilityIsPdf = feasibility?.feasibilityFormat === "UPLOADED_PDF";
  const feasibilityHasBeenSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;

  const feasibilityTileDisabled = useMemo(() => {
    switch (true) {
      case candidacyIsAutonome:
        return false;
      case !feasibility:
        return true;
      case feasibilityHasBeenSentToCandidate || feasibilityIsPdf:
        return false;
      default:
        return true;
    }
  }, [
    feasibility,
    feasibilityHasBeenSentToCandidate,
    feasibilityIsPdf,
    candidacyIsAutonome,
  ]);

  const feasibilityUrl = isFeasibilityDemat
    ? "/validate-feasibility"
    : "/feasibility";

  return (
    <Tile
      disabled={feasibilityTileDisabled}
      title="Dossier de faisabilité"
      start={
        <FeasibilityBadge feasibility={feasibility} isCaduque={isCaduque} />
      }
      small
      buttonProps={{
        onClick: () => {
          router.push(feasibilityUrl);
        },
      }}
      imageUrl="/candidat/images/pictograms/contract.svg"
    />
  );
};
