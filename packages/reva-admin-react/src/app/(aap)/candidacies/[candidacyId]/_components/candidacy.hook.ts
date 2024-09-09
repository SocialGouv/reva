import { useAuth } from "@/components/auth/auth";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { useMemo } from "react";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";

export type CandidacyForStatus = {
  id: string;
  candidacyStatuses: {
    status: CandidacyStatusStep;
    isActive: boolean;
  }[];
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
  candidacyDropOut?: unknown;
};

export const useCandidacyStatus = (candidacy: CandidacyForStatus) => {
  const isCandidacyReoriented = !!candidacy.reorientationReason;
  const isCandidacyArchived = candidacy.candidacyStatuses.some(
    (s) => s.isActive && s.status === "ARCHIVE",
  );

  const { isAdmin } = useAuth();

  const candidacyCurrentActiveStatus = useMemo(() => {
    return candidacy.candidacyStatuses.find((s) => s.isActive)?.status;
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
    isCandidacyDroppedOut && !isCandidacyArchivedAndNotReoriented && !!isAdmin;

  return {
    candidacyCurrentActiveStatus,
    isCandidacyDroppedOut,
    canBeArchived,
    canBeRestored,
    canDroput,
    canCancelDropout,
  };
};
