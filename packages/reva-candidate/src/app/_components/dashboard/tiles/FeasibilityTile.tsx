import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { FeasibilityUseCandidateForDashboard } from "../dashboard.hooks";
const FeasibilityBadge = ({
  feasibility,
  isCaduque,
  candidacyIsAutonome,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  isCaduque: boolean;
  candidacyIsAutonome: boolean;
}) => {
  const decision = feasibility?.decision;
  const isDfDemat = feasibility?.feasibilityFormat === "DEMATERIALIZED";
  const isSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;
  const isCandidateConfirmed =
    !!feasibility?.dematerializedFeasibilityFile?.candidateConfirmationAt;
  const decisionIsDraftOrIncomplete =
    decision === "DRAFT" || decision === "INCOMPLETE";
  const needsAttestation =
    isDfDemat &&
    !candidacyIsAutonome &&
    !feasibility?.dematerializedFeasibilityFile?.swornStatementFileId;

  switch (true) {
    case isCaduque:
      return (
        <Badge severity="error" data-test="feasibility-badge-caduque">
          caduque
        </Badge>
      );
    case decisionIsDraftOrIncomplete &&
      isDfDemat &&
      isSentToCandidate &&
      !isCandidateConfirmed:
      return (
        <Badge severity="warning" data-test="feasibility-badge-to-validate">
          à valider
        </Badge>
      );

    case decisionIsDraftOrIncomplete &&
      needsAttestation &&
      isDfDemat &&
      !candidacyIsAutonome &&
      !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt:
      return (
        <Badge severity="info" data-test="feasibility-waiting-for-attestation">
          attente attestation
        </Badge>
      );
    case decisionIsDraftOrIncomplete &&
      !needsAttestation &&
      !candidacyIsAutonome:
      return (
        <Badge severity="info" data-test="feasibility-badge-to-send">
          à envoyer au certificateur
        </Badge>
      );
    case candidacyIsAutonome && (!decision || decision === "INCOMPLETE"):
      return (
        <Badge severity="warning" data-test="feasibility-badge-to-send">
          à envoyer
        </Badge>
      );
    case decision === "ADMISSIBLE":
      return (
        <Badge severity="success" data-test="feasibility-badge-admissible">
          recevable
        </Badge>
      );
    case decision === "PENDING" || decision === "COMPLETE":
      return (
        <Badge severity="info" data-test="feasibility-badge-pending">
          envoyé au certificateur
        </Badge>
      );
    case decision === "REJECTED":
      return (
        <Badge severity="error" data-test="feasibility-badge-rejected">
          non recevable
        </Badge>
      );
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
      case feasibility?.decision === "INCOMPLETE" &&
        feasibilityIsPdf &&
        !feasibility.feasibilityFileSentAt &&
        !candidacyIsAutonome:
        return true;
      case feasibility?.decision === "INCOMPLETE" &&
        !feasibility?.dematerializedFeasibilityFile?.candidateConfirmationAt &&
        !feasibilityHasBeenSentToCandidate &&
        !candidacyIsAutonome:
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
      data-test="feasibility-tile"
      disabled={feasibilityTileDisabled}
      title="Dossier de faisabilité"
      start={
        <FeasibilityBadge
          feasibility={feasibility}
          isCaduque={isCaduque}
          candidacyIsAutonome={candidacyIsAutonome}
        />
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
