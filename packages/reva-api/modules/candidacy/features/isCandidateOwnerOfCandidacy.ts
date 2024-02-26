import { prismaClient } from "../../../prisma/client";

export const isCandidateOwnerOfCandidacy = async ({
  candidacyId,
  keycloakId,
}: {
  candidacyId: string;
  keycloakId?: string;
}) =>
  !!keycloakId &&
  !!(await prismaClient.candidacy.findFirst({
    where: { id: candidacyId, candidate: { keycloakId } },
    select: { id: true },
  }));
