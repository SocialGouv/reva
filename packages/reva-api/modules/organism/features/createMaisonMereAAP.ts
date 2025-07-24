import { MaisonMereAAP } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createMaisonMereAAP = ({
  maisonMereAAP,
  ccnIds,
}: {
  maisonMereAAP: Omit<MaisonMereAAP, "id" | "createdAt" | "updatedAt">;
  ccnIds: string[];
}) =>
  prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP,
      maisonMereAAPOnConventionCollective: {
        createMany: { data: ccnIds.map((c) => ({ ccnId: c })) },
      },
    },
  });
