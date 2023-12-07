import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPById = ({ id }: { id: string }) =>
  prismaClient.maisonMereAAP.findUnique({
    where: { id },
    include: {
      maisonMereAAPOnDepartement: true,
    },
  });
