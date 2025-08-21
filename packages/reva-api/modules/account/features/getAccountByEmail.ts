import { prismaClient } from "@/prisma/client";

export const getAccountByEmail = async (email: string) =>
  prismaClient.account.findUnique({
    where: {
      email,
    },
  });
