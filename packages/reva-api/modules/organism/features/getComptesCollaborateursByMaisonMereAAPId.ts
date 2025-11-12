import { prismaClient } from "@/prisma/client";

export const getComptesCollaborateursByMaisonMereAAPId = async ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAPOnAccount
    .findMany({
      where: { maisonMereAAPId },
      include: {
        account: true,
      },
    })
    .then((moas) => moas.map((moa) => moa.account));
