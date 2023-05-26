// Types de diplôme : referentials/types-diplome.csv
import { Prisma, PrismaClient } from "@prisma/client";

import { upsertCsvRows } from "../read-csv";

export function upsertTypesDiplome(prisma: PrismaClient) {
  return upsertCsvRows<
    Prisma.TypeDiplomeCreateInput,
    Prisma.TypeDiplomeUpsertArgs
  >({
    filePath: "./referentials/types-diplome.csv",
    headersDefinition: ["label", "id", undefined],
    transform: ({ id, label }) => ({
      where: { id },
      create: { id, label },
      update: { label },
    }),
    upsertCommand: prisma.typeDiplome.upsert,
  });
}
