import { PrismaClient } from "@prisma/client";

import { parseCsvList, readCsvRows } from "./read-csv";
import { seedCertifications } from "./referentials/seed-certifications";
import { insertBasicSkillsIfNone } from "./referentials/table-basic-skills";
import { upsertNewCertifications } from "./referentials/table-certifications";
import { upsertConventionsCollectives } from "./referentials/table-conventions-collectives";
import { insertDegreesIfNone } from "./referentials/table-degrees";
import { insertDepartmentsIfNone } from "./referentials/table-departments";
import { upsertDomaines } from "./referentials/table-domaine";
import { insertDropOutReasonsIfNone } from "./referentials/table-dropout-reasons";
import { upsertGoals } from "./referentials/table-goals";
import { upsertRegions } from "./referentials/table-regions";
import { insertReorientationReasonsIfNone } from "./referentials/table-reorientation-reasons";
import { upsertTypesDiplome } from "./referentials/table-type-diplome";
import { insertVulnerabilityIndicatorsIfNone } from "./referentials/table-vulnerability-indicators";

export const prisma = new PrismaClient();

async function main() {
  await upsertDomaines(prisma);
  await upsertConventionsCollectives(prisma);
  await upsertTypesDiplome(prisma);
  await seedCertifications(prisma);
  await upsertNewCertifications(prisma);
  await upsertGoals(prisma);
  await upsertRegions(prisma);
  await insertDepartmentsIfNone(prisma);
  await insertBasicSkillsIfNone(prisma);
  await insertDegreesIfNone(prisma);
  await insertVulnerabilityIndicatorsIfNone(prisma);
  await insertDropOutReasonsIfNone(prisma);
  await insertReorientationReasonsIfNone(prisma);

  // Relations certifications
  const certificationRel = await readCsvRows<{
    certificationId: string;
    conventionCollective: string;
    domaine: string;
  }>({
    filePath: "./referentials/certifications_new.csv",
    headersDefinition: [
      undefined,
      "certificationId",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "conventionCollective",
      undefined,
      "domaine",
    ],
  });
  for (const {
    certificationId,
    conventionCollective,
    domaine,
  } of certificationRel) {
    if (conventionCollective) {
      await prisma.certificationOnConventionCollective.deleteMany({
        where: {
          certificationId,
        },
      });
      await prisma.certificationOnConventionCollective.createMany({
        data: parseCsvList(conventionCollective).map((ccnId: string) => ({
          certificationId,
          ccnId,
        })),
      });
    }
    if (domaine) {
      await prisma.certificationOnDomaine.deleteMany({
        where: {
          certificationId,
        },
      });
      await prisma.certificationOnDomaine.createMany({
        data: parseCsvList(domaine).map((domaineId: string) => ({
          certificationId,
          domaineId,
        })),
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
