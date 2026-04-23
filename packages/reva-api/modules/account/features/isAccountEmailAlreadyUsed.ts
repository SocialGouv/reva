import { prismaClient } from "@/prisma/client";

export const isAccountEmailAlreadyUsed = async ({
  accountEmail,
}: {
  accountEmail: string;
}) => {
  const account = await prismaClient.account.findUnique({
    where: {
      email: accountEmail,
    },
  });
  return !!account;
};
