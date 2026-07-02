import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import {
  hasFreshCandidateConfirmation,
  isSentToCandidateOutdatedAfterIncomplete,
} from "@/utils/feasibilityIncompleteOutdated.util";

import { FeasibilityUseCandidateForDashboard } from "../dashboard.hooks";

const FeasibilityBadge = ({
  feasibility,
  candidacyIsAutonome,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  candidacyIsAutonome: boolean;
}) => {
  const decision = feasibility?.decision;
  const isDfDemat = feasibility?.feasibilityFormat === "DEMATERIALIZED";
  const isSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;
  const isCandidateConfirmed = hasFreshCandidateConfirmation({
    decision,
    decisionSentAt: feasibility?.decisionSentAt,
    candidateConfirmationAt:
      feasibility?.dematerializedFeasibilityFile?.candidateConfirmationAt,
  });
  const decisionIsDraftOrIncomplete =
    decision === "DRAFT" || decision === "INCOMPLETE";
  const needsAttestation =
    isDfDemat &&
    !candidacyIsAutonome &&
    (!feasibility?.dematerializedFeasibilityFile?.swornStatementFileId ||
      !isCandidateConfirmed);

  switch (true) {
    case decisionIsDraftOrIncomplete &&
      isDfDemat &&
      isSentToCandidate &&
      !isCandidateConfirmed:
      return (
        <Badge severity="warning" data-testid="feasibility-badge-to-validate">
          à valider
        </Badge>
      );

    case decisionIsDraftOrIncomplete &&
      needsAttestation &&
      isDfDemat &&
      !candidacyIsAutonome &&
      !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt:
      return (
        <Badge
          severity="info"
          data-testid="feasibility-waiting-for-attestation"
        >
          attente attestation
        </Badge>
      );
    case decisionIsDraftOrIncomplete &&
      !needsAttestation &&
      !candidacyIsAutonome:
      return (
        <Badge severity="info" data-testid="feasibility-badge-to-send">
          à envoyer au certificateur
        </Badge>
      );
    case candidacyIsAutonome && (!decision || decision === "INCOMPLETE"):
      return (
        <Badge severity="warning" data-testid="feasibility-badge-to-send">
          à envoyer
        </Badge>
      );
    case decision === "ADMISSIBLE":
      return (
        <Badge severity="success" data-testid="feasibility-badge-admissible">
          recevable
        </Badge>
      );
    case decision === "PENDING" || decision === "COMPLETE":
      return (
        <Badge severity="info" data-testid="feasibility-badge-pending">
          envoyé au certificateur
        </Badge>
      );
    case decision === "REJECTED":
      return (
        <Badge severity="error" data-testid="feasibility-badge-rejected">
          non recevable
        </Badge>
      );
    default:
      return null;
  }
};

export const FeasibilityTile = ({
  feasibility,
  candidacyIsAutonome,
  feasibilityFileResourceFirstRead,
}: {
  feasibility: FeasibilityUseCandidateForDashboard;
  candidacyIsAutonome: boolean;
  feasibilityFileResourceFirstRead?: boolean;
}) => {
  const router = useRouter();

  const { isFeatureActive } = useFeatureFlipping();
  const isDfDematAutonomeEnabled = isFeatureActive("DF_DEMAT_AUTONOME");

  const isFeasibilityDemat =
    feasibility?.feasibilityFormat === "DEMATERIALIZED";
  const feasibilityIsPdf = feasibility?.feasibilityFormat === "UPLOADED_PDF";
  const feasibilityHasBeenSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;

  const isIncompleteNotResentToCandidate =
    !candidacyIsAutonome &&
    isSentToCandidateOutdatedAfterIncomplete({
      decision: feasibility?.decision,
      decisionSentAt: feasibility?.decisionSentAt,
      sentToCandidateAt:
        feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt,
    });

  const feasibilityTileDisabled = useMemo(() => {
    switch (true) {
      case candidacyIsAutonome:
        return false;
      case !feasibility:
        return true;
      case isIncompleteNotResentToCandidate:
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
    isIncompleteNotResentToCandidate,
  ]);

  let feasibilityUrl = isFeasibilityDemat
    ? "./validate-feasibility"
    : "./feasibility";

  if (candidacyIsAutonome && isDfDematAutonomeEnabled) {
    feasibilityUrl = feasibilityFileResourceFirstRead
      ? "./feasibility-demat-autonome"
      : "./feasibility-demat-autonome-resources";
  }

  return (
    <Tile
      data-testid="feasibility-tile"
      disabled={feasibilityTileDisabled}
      title="Dossier de faisabilité"
      start={
        <FeasibilityBadge
          feasibility={feasibility}
          candidacyIsAutonome={candidacyIsAutonome}
        />
      }
      small
      imageSvg
      buttonProps={{
        onClick: () => {
          router.push(feasibilityUrl);
        },
      }}
      imageUrl="/candidat/images/pictograms/contract.svg"
      className="h-[200px]"
    />
  );
};
