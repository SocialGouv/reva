import { CertificationAuthorityContestationDecision } from "@prisma/client";

export type CreateCandidacyContestationCaduciteInput = {
  candidacyId: string;
  contestationReason: string;
  readyForJuryEstimatedAt: Date;
};

export type UpdateCandidacyContestationCaduciteInput = {
  candidacyId: string;
  certificationAuthorityContestationDecision: CertificationAuthorityContestationDecision;
};
