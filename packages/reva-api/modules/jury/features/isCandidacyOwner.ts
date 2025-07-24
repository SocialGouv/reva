import { prismaClient } from "@/prisma/client";

export const isCandidacyOwner = async (
  keycloakId: string,
  candidacyId: string,
): Promise<boolean> => {
  const candidate = await prismaClient.candidate.findFirst({
    where: { keycloakId },
  });
  if (!candidate) {
    return false;
  }

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
  if (candidacy?.candidateId != candidate.id) {
    return false;
  }

  return true;
};
