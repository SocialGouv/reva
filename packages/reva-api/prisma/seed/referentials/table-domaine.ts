import { Prisma, PrismaClient } from "@prisma/client";

import { upsertCsvRows } from "../read-csv";

// Domaines : referentials/domaines.csv
export function upsertDomaines(prisma: PrismaClient) {
  return upsertCsvRows<Prisma.DomaineCreateInput, Prisma.DomaineUpsertArgs>({
    filePath: "./referentials/domaines.csv",
    headersDefinition: ["label", "id", "code", undefined],
    transform: ({ id, label, code }) => ({
      where: { id },
      create: { id, label, code },
      update: { label },
    }),
    upsertCommand: prisma.domaine.upsert,
  });
}
