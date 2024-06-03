import { MaisonMereAAP } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { MaisonMereAAPOnDepartement } from "../organism.types";

export const createMaisonMereAAP = ({
  maisonMereAAP,
  ccnIds,
  maisonMereAAPOnDepartements,
}: {
  maisonMereAAP: Omit<MaisonMereAAP, "id" | "createdAt" | "updatedAt">;
  ccnIds: string[];
  maisonMereAAPOnDepartements: MaisonMereAAPOnDepartement[];
}) =>
  prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP,
      maisonMereAAPOnConventionCollective: {
        createMany: { data: ccnIds.map((c) => ({ ccnId: c })) },
      },
      maisonMereAAPOnDepartement: {
        createMany: { data: maisonMereAAPOnDepartements },
      },
    },
  });
