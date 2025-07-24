import { prismaClient } from "@/prisma/client";

export const getAAPLogs = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  if (!maisonMereAAPId) {
    throw new Error("Identifiant de maison mère absent");
  }
  return prismaClient.aAPLog.findMany({
    where: { maisonMereAAPId },
    orderBy: { createdAt: "desc" },
  });
};
