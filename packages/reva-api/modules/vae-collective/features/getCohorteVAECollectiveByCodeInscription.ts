import { prismaClient } from "@/prisma/client";

export const getCohorteVAECollectiveByCodeInscription = async ({
  codeInscription,
}: {
  codeInscription: string;
}) =>
  prismaClient.cohorteVaeCollective.findFirst({
    where: {
      codeInscription: {
        equals: codeInscription,
        mode: "insensitive",
      },
    },
  });
