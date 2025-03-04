import { useAuth } from "@/components/auth/auth";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { useMemo } from "react";
import {
  CandidacyStatusStep,
  FinanceModule,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

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
};

export const useCandidacyStatus = (candidacy: CandidacyForStatus) => {
  const isCandidacyReoriented = !!candidacy.reorientationReason;
  const isCandidacyArchived = candidacy.status === "ARCHIVE";

  const { isAdmin } = useAuth();
  const { isFeatureActive } = useFeatureflipping();

  const candidacyCurrentActiveStatus = useMemo(() => {
    return candidacy.status;
  }, [candidacy]);

  const isCandidacyArchivedAndNotReoriented =
    isCandidacyArchived && !isCandidacyReoriented;

  const isCandidacyDroppedOut = !!candidacy.candidacyDropOut;

  const canBeArchived =
    candidacyCurrentActiveStatus &&
    !isCandidacyArchivedAndNotReoriented &&
    (!isCandidacyStatusEqualOrAbove(
      candidacyCurrentActiveStatus,
      "PARCOURS_CONFIRME",
    ) ||
      isAdmin);

  const canBeRestored = isCandidacyArchivedAndNotReoriented && isAdmin;

  const canDroput =
    !isCandidacyDroppedOut && !isCandidacyArchivedAndNotReoriented;

  const canCancelDropout =
    isCandidacyDroppedOut &&
    !candidacy.candidacyDropOut?.proofReceivedByAdmin &&
    !isCandidacyArchivedAndNotReoriented &&
    !!isAdmin;

  const canSwitchFinanceModuleToHorsPlateforme =
    isFeatureActive("ADMIN_FINANCE_AND_TYPE_ACCOMPAGNEMENT_UPDATE_BUTTONS") &&
    isAdmin &&
    candidacy.financeModule === "unifvae";

  const canSwitchTypeAccompagnementToAutonome =
    isFeatureActive("ADMIN_FINANCE_AND_TYPE_ACCOMPAGNEMENT_UPDATE_BUTTONS") &&
    isAdmin &&
    candidacy.financeModule === "hors_plateforme" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE";

  return {
    candidacyCurrentActiveStatus,
    isCandidacyDroppedOut,
    canBeArchived,
    canBeRestored,
    canDroput,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
  };
};
