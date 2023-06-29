import { Prisma, PrismaClient } from "@prisma/client";

import { injectCsvRows } from "./read-csv";
import { seedCertifications } from "./referentials/seed-certifications";
import { insertBasicSkillsIfNone } from "./referentials/table-basic-skills";
import { insertDegreesIfNone } from "./referentials/table-degrees";
import { insertDepartmentsIfNone } from "./referentials/table-departments";
import { insertDropOutReasonsIfNone } from "./referentials/table-dropout-reasons";
import { upsertGoals } from "./referentials/table-goals";
import { upsertRegions } from "./referentials/table-regions";
import { insertReorientationReasonsIfNone } from "./referentials/table-reorientation-reasons";
import { upsertTrainings } from "./referentials/table-trainings";
import { insertVulnerabilityIndicatorsIfNone } from "./referentials/table-vulnerability-indicators";

export const prisma = new PrismaClient();

async function main() {
  await upsertGoals(prisma);
  await upsertRegions(prisma);
  await insertDepartmentsIfNone(prisma);
  await insertBasicSkillsIfNone(prisma);
  await insertDegreesIfNone(prisma);
  await upsertTrainings(prisma);
  await insertVulnerabilityIndicatorsIfNone(prisma);
  await insertDropOutReasonsIfNone(prisma);
  await insertReorientationReasonsIfNone(prisma);

  // Domaines : referentials/domaines.csv
  await injectCsvRows<Prisma.DomaineCreateInput, Prisma.DomaineUpsertArgs>({
    filePath: "./referentials/domaines.csv",
    headersDefinition: ["label", "id", "code", undefined],
    transform: ({ id, label, code }) => ({
      where: { id },
      create: { id, label, code },
      update: { label },
    }),
    injectCommand: prisma.domaine.upsert,
  });

  // Conventions collectives : referentials/conventions-collectives.csv
  await injectCsvRows<
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
    injectCommand: prisma.conventionCollective.upsert,
  });

  // Types de diplôme : referentials/types-diplome.csv
  await injectCsvRows<
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
    injectCommand: prisma.typeDiplome.upsert,
  });

  await seedCertifications(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
