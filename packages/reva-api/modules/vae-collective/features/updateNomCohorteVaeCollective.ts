import { prismaClient } from "@/prisma/client";

export const updateNomCohorteVaeCollective = async ({
  cohorteVaeCollectiveId,
  nomCohorteVaeCollective,
}: {
  cohorteVaeCollectiveId: string;
  nomCohorteVaeCollective: string;
}) =>
  prismaClient.cohorteVaeCollective.update({
    where: {
      id: cohorteVaeCollectiveId,
    },
    data: {
      nom: nomCohorteVaeCollective,
    },
  });
