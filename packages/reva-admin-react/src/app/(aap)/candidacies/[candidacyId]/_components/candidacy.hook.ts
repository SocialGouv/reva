import { useMemo } from "react";

import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";

import {
  CandidacyStatusStep,
  EndAccompagnementStatus,
  FeasibilityDecision,
  FinanceModule,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

export type CandidacyForStatus = {
  id: string;
  status: CandidacyStatusStep;
  reorientationReason?:
    | {
        id?: string;
        label: string;
        disabled: boolean;
      }
    | {
        id: string;
      }
    | null;
  candidacyDropOut?:
    | {
        __typename?: "CandidacyDropOut";
        createdAt: number;
        proofReceivedByAdmin: boolean;
      }
    | null
    | undefined;
  financeModule: FinanceModule;
  typeAccompagnement: TypeAccompagnement;
  feasibility?: {
    decision: FeasibilityDecision;
  } | null;
  endAccompagnementStatus?: EndAccompagnementStatus | null;
  endAccompagnementDate?: number | null;
};

export const useCandidacyStatus = (candidacy: CandidacyForStatus) => {
  const { isAdmin } = useAuth();
  const { isFeatureActive } = useFeatureflipping();

  const currentStatus = useMemo(() => {
    return candidacy.status;
  }, [candidacy]);

  const isCandidacyReoriented = !!candidacy.reorientationReason;
  const isCandidacyArchived = currentStatus === "ARCHIVE";
  const isCandidacyDroppedOut = !!candidacy.candidacyDropOut;

  const isArchivedAndNotReoriented =
    isCandidacyArchived && !isCandidacyReoriented;

  const isWaitingForFeasibilityDecision =
    currentStatus === "DOSSIER_FAISABILITE_ENVOYE";

  const isFeasibilitySentOrLater = isCandidacyStatusEqualOrAbove(
    currentStatus,
    "DOSSIER_FAISABILITE_ENVOYE",
  );

  const isFeasibilityIncomplete =
    currentStatus === "DOSSIER_FAISABILITE_INCOMPLET";

  const isFeasibilityIncompletOrLater = isCandidacyStatusEqualOrAbove(
    currentStatus,
    "DOSSIER_FAISABILITE_INCOMPLET",
  );

  const isEndAccompagnementConfirmed =
    candidacy.endAccompagnementStatus === "CONFIRMED_BY_CANDIDATE" ||
    candidacy.endAccompagnementStatus === "CONFIRMED_BY_ADMIN";

  const hasDropoutProofReceived =
    !!candidacy.candidacyDropOut?.proofReceivedByAdmin;

  // Permissions d'archivage
  const canBeArchived =
    !isWaitingForFeasibilityDecision &&
    currentStatus &&
    !isArchivedAndNotReoriented &&
    (!isFeasibilityIncompletOrLater || isAdmin);

  const canBeRestored = isArchivedAndNotReoriented && isAdmin;

  // Permissions d'abandon
  // Admin : peut abandonner si non abandonnée, non archivée, et pas en attente de décision
  const canDropoutAsAdmin =
    !isCandidacyDroppedOut &&
    !isArchivedAndNotReoriented &&
    !isWaitingForFeasibilityDecision;

  // AAP : peut abandonner si non abandonnée, non archivée, dossier de faisabilité envoyé ou incomplet,
  // fin d'accompagnement non confirmée, et pas en attente de décision
  const canDropoutAsAap =
    !isCandidacyDroppedOut &&
    !isArchivedAndNotReoriented &&
    (isFeasibilitySentOrLater || isFeasibilityIncomplete) &&
    !isEndAccompagnementConfirmed &&
    !isWaitingForFeasibilityDecision;

  const canDropout = isAdmin ? canDropoutAsAdmin : canDropoutAsAap;

  const canCancelDropout =
    isCandidacyDroppedOut &&
    !hasDropoutProofReceived &&
    !isArchivedAndNotReoriented &&
    !!isAdmin;

  // Permissions de financement et accompagnement
  const canSwitchFinanceModuleToHorsPlateforme =
    isAdmin && candidacy.financeModule === "unifvae";

  const canSwitchTypeAccompagnementToAutonome =
    isAdmin &&
    candidacy.financeModule === "hors_plateforme" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE";

  // Permissions de fin d'accompagnement
  const isFeatureEndAccompagnementActive =
    isFeatureActive("END_ACCOMPAGNEMENT");

  const hasFeasibilityAdmissible =
    candidacy.feasibility?.decision === "ADMISSIBLE";

  const canEndAccompagnement =
    hasFeasibilityAdmissible && isFeatureEndAccompagnementActive;

  return {
    candidacyCurrentActiveStatus: currentStatus,
    isCandidacyDroppedOut,
    canBeArchived,
    canBeRestored,
    canDropout,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
    canEndAccompagnement,
  };
};
