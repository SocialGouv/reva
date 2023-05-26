import { Prisma, PrismaClient } from "@prisma/client";

import { upsertCsvRows } from "../read-csv";

// Conventions collectives : referentials/conventions-collectives.csv
export function upsertConventionsCollectives(prisma: PrismaClient) {
  return upsertCsvRows<
    Prisma.ConventionCollectiveCreateInput,
    Prisma.ConventionCollectiveUpsertArgs
  >({
    filePath: "./referentials/conventions-collectives.csv",
    headersDefinition: ["label", "id", undefined, "code", undefined, undefined],
    transform: ({ id, label, code }) => ({
      where: { id },
      create: { id, label, code },
      update: { label },
    }),
    upsertCommand: prisma.conventionCollective.upsert,
  });
}
