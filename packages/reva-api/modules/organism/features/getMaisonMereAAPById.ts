import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPById = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  prismaClient.maisonMereAAP.findFirst({
    where: { id: maisonMereAAPId },
  });
