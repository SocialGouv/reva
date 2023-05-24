import { Prisma, PrismaClient } from "@prisma/client";

import { readCsvRows, upsertCsvRows } from "./read-csv";
import { seedCertifications } from "./referentials/seed-certifications";
import { insertBasicSkillsIfNone } from "./referentials/table-basic-skills";
import { insertDegreesIfNone } from "./referentials/table-degrees";
import { insertDepartmentsIfNone } from "./referentials/table-departments";
import { insertDropOutReasonsIfNone } from "./referentials/table-dropout-reasons";
import { upsertGoals } from "./referentials/table-goals";
import { upsertRegions } from "./referentials/table-regions";
import { insertReorientationReasonsIfNone } from "./referentials/table-reorientation-reasons";
import { insertVulnerabilityIndicatorsIfNone } from "./referentials/table-vulnerability-indicators";

export const prisma = new PrismaClient();

async function main() {
  await seedCertifications(prisma);
  await upsertGoals(prisma);
  await upsertRegions(prisma);
  await insertDepartmentsIfNone(prisma);
  await insertBasicSkillsIfNone(prisma);
  await insertDegreesIfNone(prisma);
  await insertVulnerabilityIndicatorsIfNone(prisma);
  await insertDropOutReasonsIfNone(prisma);
  await insertReorientationReasonsIfNone(prisma);

  // Domaines : referentials/domaines.csv
  await upsertCsvRows<Prisma.DomaineCreateInput, Prisma.DomaineUpsertArgs>({
    filePath: "./referentials/domaines.csv",
    headersDefinition: ["label", "id", "code", undefined],
    transform: ({ id, label, code }) => ({
      where: { id },
      create: { id, label, code },
      update: { label },
    }),
    upsertCommand: prisma.domaine.upsert,
  });

  // Conventions collectives : referentials/conventions-collectives.csv
  await upsertCsvRows<
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

  // Types de diplôme : referentials/types-diplome.csv
  await upsertCsvRows<
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

  // Certifications : referentials/certifications_new.csv
  await upsertCsvRows<
    Prisma.CertificationCreateInput & {
      level: string;
    },
    Prisma.CertificationUpsertArgs
  >({
    filePath: "./referentials/certifications_new.csv",
    headersDefinition: [
      "rncpId",
      "id",
      "label",
      "summary",
      "acronym",
      "typeDiplome",
      "level",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ],
    transform: ({
      id,
      label,
      rncpId,
      summary,
      level,
      acronym,
      typeDiplome,
    }) => ({
      where: { id },
      create: {
        id,
        rncpId,
        label,
        level: parseInt(level),
        summary,
        acronym,
        slug: "",
        typeDiplomeId: typeDiplome as string,
      },
      update: {
        rncpId,
        label,
        level: parseInt(level),
        summary,
        acronym,
        slug: "",
        typeDiplomeId: typeDiplome as string,
      },
    }),
    upsertCommand: prisma.certification.upsert,
  });

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
      undefined,
      undefined,
      undefined,
      undefined,
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

function parseCsvList(str: string): string[] {
  return str
    .trim()
    .split(",")
    .map((s: string) => s.trim());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
