import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCohorteVAECollectiveByCodeInscription = async ({
  codeInscription,
}: {
  codeInscription: string;
}) =>
  prisma.cohorteVaeCollective.findUnique({
    where: { codeInscription },
  });
