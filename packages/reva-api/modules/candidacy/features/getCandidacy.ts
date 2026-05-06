import { prismaClient } from "@/prisma/client";

export const getCandidacy = async ({
  candidacyId,
  userKeycloakId,
  userRoles,
}: {
  candidacyId: string;
  userKeycloakId?: string;
  userRoles?: KeyCloakUserRole[];
}) => {
  if (!candidacyId) {
    return null;
  }

  if (userKeycloakId && userRoles?.includes("candidate")) {
    await prismaClient.candidacy.updateMany({
      where: {
        id: candidacyId,
        candidate: { keycloakId: userKeycloakId },
      },
      data: { lastOpenedAt: new Date() },
    });
  }

  return prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
  });
};
