import { useAuth } from "@/components/auth/auth";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { useMemo } from "react";
import {
  CandidacyStatusStep,
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
};

export const useCandidacyStatus = (candidacy: CandidacyForStatus) => {
  const isCandidacyReoriented = !!candidacy.reorientationReason;
  const isCandidacyArchived = candidacy.status === "ARCHIVE";

  const { isAdmin } = useAuth();

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
      "DOSSIER_FAISABILITE_INCOMPLET",
    ) ||
      isAdmin);

  const canBeRestored = isCandidacyArchivedAndNotReoriented && isAdmin;

  const feasibilitySent = isCandidacyStatusEqualOrAbove(
    candidacy.status,
    "DOSSIER_FAISABILITE_ENVOYE",
  );

  //an admin can dropout a candidacy if it's not dropped out nor archived
  const canDropout = isAdmin
    ? !isCandidacyDroppedOut && !isCandidacyArchivedAndNotReoriented
    : //an aap can dropout a candidacy if it's not dropped out nor archived and only if its feasibility file has been sent
      !isCandidacyDroppedOut &&
      !isCandidacyArchivedAndNotReoriented &&
      feasibilitySent;

  const canCancelDropout =
    isCandidacyDroppedOut &&
    !candidacy.candidacyDropOut?.proofReceivedByAdmin &&
    !isCandidacyArchivedAndNotReoriented &&
    !!isAdmin;

  const canSwitchFinanceModuleToHorsPlateforme =
    isAdmin && candidacy.financeModule === "unifvae";

  const canSwitchTypeAccompagnementToAutonome =
    isAdmin &&
    candidacy.financeModule === "hors_plateforme" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE";

  return {
    candidacyCurrentActiveStatus,
    isCandidacyDroppedOut,
    canBeArchived,
    canBeRestored,
    canDropout,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
  };
};
