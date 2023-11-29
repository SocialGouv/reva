import { MaisonMereAAP } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { MaisonMereAAPOnDepartement } from "../organism.types";

export const createMaisonMereAAP = ({
  maisonMereAAP,
  ccnIds,
  domaineIds,
  maisonMereAAPOnDepartements,
}: {
  maisonMereAAP: Omit<MaisonMereAAP, "id" | "createdAt" | "updatedAt">;
  ccnIds: string[];
  domaineIds: string[];
  maisonMereAAPOnDepartements: MaisonMereAAPOnDepartement[];
}) =>
  prismaClient.maisonMereAAP.create({
    data: {
      ...maisonMereAAP,
      maisonMereAAPOnConventionCollective: {
        createMany: { data: ccnIds.map((c) => ({ ccnId: c })) },
      },
      maisonMereAAPOnDomaine: {
        createMany: { data: domaineIds.map((d) => ({ domaineId: d })) },
      },
      maisonMereAAPOnDepartement: {
        createMany: { data: maisonMereAAPOnDepartements },
      },
    },
  });
