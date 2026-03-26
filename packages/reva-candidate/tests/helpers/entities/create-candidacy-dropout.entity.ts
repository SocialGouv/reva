import type { CandidacyDropOut } from "@/graphql/generated/graphql";

export const createCandidacyDropOutEntity = ({
  createdAt = Date.now(),
  proofReceivedByAdmin = false,
  dropOutConfirmedByCandidate = false,
}: {
  createdAt?: number;
  proofReceivedByAdmin?: boolean;
  dropOutConfirmedByCandidate?: boolean;
} = {}): CandidacyDropOut => ({
  createdAt,
  proofReceivedByAdmin,
  dropOutConfirmedByCandidate,
  dropOutReason: {
    id: "reason-1",
    label: "Motif d'abandon",
    isActive: true,
  },
  status: "PROJET",
});
