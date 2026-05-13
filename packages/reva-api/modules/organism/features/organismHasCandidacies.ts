import { prismaClient } from "@/prisma/client";

export const organismHasCandidacies = async ({
  organismId,
}: {
  organismId: string;
}) =>
  prismaClient.organism
    .findUnique({
      where: { id: organismId },
      include: { candidacies: { take: 1 } },
    })
    .then((organism) => !!organism?.candidacies?.length);
