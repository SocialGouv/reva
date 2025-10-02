import { Prisma, PrismaClient } from "@prisma/client";

import { addExtensions } from "./add-extensions";
import { injectCsvRows } from "./read-csv";
import { seedCandidacyConventionCollective } from "./referentials/seed-candidacy-convention-collective";
import { seedCertifications } from "./referentials/seed-certifications";
import { seedFormacodesV13 } from "./referentials/seed-formacodes-v13";
import { seedFormacodesV14 } from "./referentials/seed-formacodes-v14";
import { insertBasicSkillsIfNone } from "./referentials/table-basic-skills";
import { insertDegreesIfNone } from "./referentials/table-degrees";
import { upsertDepartments } from "./referentials/table-departments";
import { insertDropOutReasonsIfNone } from "./referentials/table-dropout-reasons";
import { upsertGoals } from "./referentials/table-goals";
import { upsertRegions } from "./referentials/table-regions";
import { insertReorientationReasonsIfNone } from "./referentials/table-reorientation-reasons";
import { upsertTrainings } from "./referentials/table-trainings";
import { insertVulnerabilityIndicatorsIfNone } from "./referentials/table-vulnerability-indicators";

async function main() {
  const seedRestrictedToContainer = process.env.RESTRICT_SEED_TO_CONTAINER;
  const containerName = process.env.CONTAINER;
  if (
    !seedRestrictedToContainer ||
    seedRestrictedToContainer === containerName
  ) {
    await executeSeed();
  }
}

const executeSeed = async () => {
  await upsertGoals(prisma);
  await upsertRegions(prisma);
  await upsertDepartments(prisma);
  await insertBasicSkillsIfNone(prisma);
  await insertDegreesIfNone(prisma);
  await upsertTrainings(prisma);
  await insertVulnerabilityIndicatorsIfNone(prisma);
  await insertDropOutReasonsIfNone(prisma);
  await insertReorientationReasonsIfNone(prisma);

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

  await seedFormacodesV13(prisma);
  await seedFormacodesV14(prisma);

  await seedCertifications(prisma);

  await seedCandidacyConventionCollective(prisma);

  await addExtensions(prisma);
};

const prisma = new PrismaClient();

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
