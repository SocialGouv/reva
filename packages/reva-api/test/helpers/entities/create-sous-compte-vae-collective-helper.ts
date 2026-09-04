import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createAccountHelper } from "./create-account-helper";

export const createSousCompteVaeCollectiveHelper = async ({
  commanditaireVaeCollectiveId,
  ...sousCompteArgs
}: { commanditaireVaeCollectiveId: string } & Partial<
  Omit<
    Prisma.SousCompteVaeCollectiveUncheckedCreateInput,
    "commanditaireVaeCollectiveId"
  >
>) => {
  const accountId =
    sousCompteArgs.accountId ?? (await createAccountHelper()).id;

  return prismaClient.sousCompteVaeCollective.create({
    data: {
      ...sousCompteArgs,
      commanditaireVaeCollectiveId,
      accountId,
    },
  });
};
