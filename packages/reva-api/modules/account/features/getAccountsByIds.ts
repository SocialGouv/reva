import { prismaClient } from "../../../prisma/client";

export const getAccountsByIds = ({ accountIds }: { accountIds: string[] }) =>
  prismaClient.account.findMany({ where: { id: { in: accountIds } } });
