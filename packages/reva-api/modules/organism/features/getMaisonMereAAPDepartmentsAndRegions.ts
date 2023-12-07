import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPOnDepartments = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAPOnDepartement.findMany({
    where: { maisonMereAAPId },
  });
