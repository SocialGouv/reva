import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPById = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) =>
  maisonMereAAPId
    ? prismaClient.maisonMereAAP.findUnique({
        where: { id: maisonMereAAPId },
      })
    : null;
