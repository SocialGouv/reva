import { prismaClient } from "../../../prisma/client";

export const getCandidacyLogs = ({ candidacyId }: { candidacyId: string }) =>
  prismaClient.candidacyLog.findMany({
    where: { candidacyId },
    orderBy: { createdAt: "desc" },
  });
