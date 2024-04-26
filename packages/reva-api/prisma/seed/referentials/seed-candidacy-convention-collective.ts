// Conventions collectives candidature : referentials/candidacy-convention-collective.csv

import { PrismaClient } from "@prisma/client";

import { readCsvRows } from "../read-csv";

export async function seedCandidacyConventionCollective(prisma: PrismaClient) {
  await prisma.$transaction(
    async (tx) => {
      await tx.candidacyConventionCollective.deleteMany();

      const ccn = await readCsvRows<{
        id: string;
        idcc: string;
        label: string;
      }>({
        filePath: "./referentials/candidacy-convention-collective.csv",
        headersDefinition: ["id", "idcc", "label"],
      });

      await tx.candidacyConventionCollective.createMany({
        data: ccn,
      });
    },
    { maxWait: 5000, timeout: 15000 },
  );
}
