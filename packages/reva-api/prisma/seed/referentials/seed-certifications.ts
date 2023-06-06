import { Prisma, PrismaClient } from "@prisma/client";

import { logger } from "../../../infra/logger";
import { upsertCsvRows } from "../read-csv";

export async function seedCertifications(prisma: PrismaClient) {
  // Upsert from CSV
  await upsertCertificationsXp(prisma);

  // 6/05/2023 : Supprimer la certification RNCP 37231
  // trello.com/c/5lRTQtl2/757-modification-du-airtable
  // Attention à ça si un jour elle est ajoutée de nouveau!!
  const { count } = await prisma.certification.deleteMany({
    where: { rncpId: "37231" },
  });
  console.log(`Deleted ${count} certification(s) with RNCPID 37231`);

  // Refresh materialized views
  await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW certification_search WITH DATA;
  `;
  await prisma.$queryRaw`
    REFRESH MATERIALIZED VIEW profession_search WITH DATA;
  `;
}

async function upsertCertificationsXp(prisma: PrismaClient) {
  console.log("upsertCertificationsXp");
  await upsertCsvRows<
    Prisma.CertificationCreateInput & { level: string },
    Prisma.CertificationUpsertArgs
  >({
    filePath: "./referentials/certifications_xp.csv",
    headersDefinition: [
      "id",
      "slug",
      "rncpId",
      undefined,
      undefined,
      "label",
      "abilities",
      "accessibleJobType",
      "acronym",
      "activities",
      "activityArea",
      "level",
      "summary",
      "status",
      undefined,
    ],
    transform: ({
      id,
      slug,
      rncpId,
      label,
      abilities,
      accessibleJobType,
      acronym,
      activities,
      activityArea,
      level,
      summary,
      status,
    }) => ({
      where: { id },
      create: {
        id,
        slug,
        rncpId,
        label,
        abilities,
        accessibleJobType,
        acronym,
        activities,
        activityArea,
        level: parseInt(level),
        summary,
        status,
      },
      update: {
        slug,
        rncpId,
        label,
        abilities,
        accessibleJobType,
        acronym,
        activities,
        activityArea,
        level: parseInt(level),
        summary,
        status,
      },
    }),
    upsertCommand: prisma.certification.upsert,
  });

  const count = await prisma.$queryRaw`
  select count(1) from certification;
`;

  logger.info(`${(count as any)[0].count} certifications inserted`);
}
