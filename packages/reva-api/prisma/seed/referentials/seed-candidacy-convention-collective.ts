// Conventions collectives candidature : referentials/candidacy-convention-collective-*.csv

import { PrismaClient } from "@prisma/client";

import { readCsvRows } from "../read-csv";

const getCcnV1 = async (): Promise<
  {
    id: string;
    idcc: string;
    label: string;
  }[]
> => {
  const ccn = await readCsvRows<{
    id: string;
    idcc: string;
    label: string;
  }>({
    filePath: "./referentials/candidacy-convention-collective-v1.csv",
    headersDefinition: ["id", "idcc", "label"],
  });

  return ccn;
};

const getCcnV2 = async (): Promise<
  {
    id: string;
    idcc: string;
    label: string;
  }[]
> => {
  const ccn = await readCsvRows<{
    id: string;
    idcc: string;
    label: string;
  }>({
    filePath: "./referentials/candidacy-convention-collective-v2.csv",
    headersDefinition: ["id", "idcc", "label"],
  });

  return ccn;
};

async function seedCandidacyConventionCollectiveV1(prisma: PrismaClient) {
  await prisma.$transaction(
    async (tx) => {
      await tx.candidacyConventionCollective.deleteMany();

      const ccn = await getCcnV1();

      await tx.candidacyConventionCollective.createMany({
        data: ccn,
      });
    },
    { maxWait: 5000, timeout: 15000 },
  );
}

async function seedCandidacyConventionCollectiveV2(prisma: PrismaClient) {
  await prisma.$transaction(
    async (tx) => {
      const ccnV1 = await getCcnV1();
      const ccnV2 = await getCcnV2();

      const date = new Date();

      const createdAt = date;
      const disabledAt = date;
      const updatedAt = date;

      for (const v1 of ccnV1) {
        const v2 = ccnV2.find((value) => value.idcc == v1.idcc);
        if (v2) {
          // Update if found
          if (v1.label != v2.label) {
            await tx.candidacyConventionCollective.update({
              where: { id: v1.id },
              data: {
                label: v2.label,
                updatedAt,
              },
            });
          }
        }
        // Disable if not found
        else {
          await tx.candidacyConventionCollective.update({
            where: { id: v1.id },
            data: {
              disabledAt,
            },
          });
        }
      }

      for (const v2 of ccnV2) {
        const v1 = ccnV1.find((value) => value.idcc == v2.idcc);

        // Create if not found
        if (!v1) {
          await tx.candidacyConventionCollective.create({
            data: {
              id: v2.id,
              idcc: v2.idcc,
              label: v2.label,
              createdAt,
            },
          });
        }
      }
    },
    { maxWait: 5000, timeout: 15000 },
  );
}

export async function seedCandidacyConventionCollective(prisma: PrismaClient) {
  await seedCandidacyConventionCollectiveV1(prisma);
  await seedCandidacyConventionCollectiveV2(prisma);
}
