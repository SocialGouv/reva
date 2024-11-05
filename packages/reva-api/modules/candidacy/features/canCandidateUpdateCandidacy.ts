import { CandidacyStatusStep } from "@prisma/client";

export const canCandidateUpdateCandidacy = async ({
  candidacy,
}: {
  candidacy: { status: CandidacyStatusStep };
}): Promise<boolean> => {
  return [
    "PROJET",
    "VALIDATION",
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
  ].includes(candidacy.status);
};
