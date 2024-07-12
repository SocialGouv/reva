import { prismaClient } from "../../../prisma/client";

export const getAccountsByOrganismIdAndEmail = ({
  organismId,
  email,
}: {
  organismId: string;
  email: string;
}) =>
  prismaClient.account.findUnique({
    where: { organismId, email },
  });
