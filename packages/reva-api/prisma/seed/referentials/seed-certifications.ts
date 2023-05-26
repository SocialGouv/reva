import { Prisma, PrismaClient } from "@prisma/client";

import { logger } from "../../../infra/logger";
import { upsertCsvRows } from "../read-csv";

export async function seedCertifications(prisma: PrismaClient) {
  // Upsert from CSV
  await upsertCertificationsXp(prisma);

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
    Prisma.CertificationCreateInput & { level: string; typeDiplome: string },
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
      "typeDiplome",
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
      typeDiplome,
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
        typeDiplome: { connect: { label: typeDiplome } },
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
        typeDiplome: { connect: { label: typeDiplome } },
        activities,
        activityArea,
        level: parseInt(level),
        summary,
        status,
      },
    }),
    upsertCommand: (obj: Prisma.CertificationUpsertArgs) => {
      console.log(
        `id: ${obj.where.id} - typeDiplome: ${
          (obj as any).update.typeDiplome.connect.label
        }`
      );
      return prisma.certification.upsert(obj);
    },
  });

  const count = await prisma.$queryRaw`
  select count(1) from certification;
`;

  logger.info(`${(count as any)[0].count} certifications inserted`);
}
