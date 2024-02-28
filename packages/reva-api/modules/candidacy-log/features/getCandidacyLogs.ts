import { prismaClient } from "../../../prisma/client";

export const getCandidacyLogs = ({ candidacyId }: { candidacyId: string }) => {
  if (!candidacyId) {
    throw new Error("Identifiant de candidature absent");
  }
  return prismaClient.candidacyLog.findMany({
    where: { candidacyId },
    orderBy: { createdAt: "desc" },
  });
};
