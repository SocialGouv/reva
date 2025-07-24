import { prismaClient } from "@/prisma/client";

export const getCohorteVAECollectiveByCodeInscription = async ({
  codeInscription,
}: {
  codeInscription: string;
}) =>
  prismaClient.cohorteVaeCollective.findUnique({
    where: { codeInscription },
  });
