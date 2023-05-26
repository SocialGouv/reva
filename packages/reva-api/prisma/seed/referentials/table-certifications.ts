import { Prisma, PrismaClient } from "@prisma/client";

import { upsertCsvRows } from "../read-csv";

// Certifications : referentials/certifications_new.csv
export function upsertNewCertifications(prisma: PrismaClient) {
  console.log("upsertCertifications NEW");
  return upsertCsvRows<
    Prisma.CertificationCreateInput & {
      level: string;
      typeDiplome: string;
    },
    Prisma.CertificationUpsertArgs
  >({
    filePath: "./referentials/certifications_new.csv",
    headersDefinition: [
      "rncpId",
      "id",
      "label",
      "summary",
      undefined,
      "typeDiplome",
      "level",
      undefined,
      undefined,
      undefined,
      undefined,
    ],
    transform: ({ id, label, rncpId, summary, level, typeDiplome }) => {
      // console.log("certifications_new", rncpId);
      console.log(`id: ${id} - typeDiplome: ${typeDiplome}`);
      return {
        where: { id },
        create: {
          id,
          rncpId,
          label,
          level: parseInt(level),
          summary,
          slug: "",
          typeDiplomeId: typeDiplome as string,
        },
        update: {
          rncpId,
          label,
          level: parseInt(level),
          summary,
          slug: "",
          typeDiplomeId: typeDiplome as string,
        },
      };
    },
    upsertCommand: prisma.certification.upsert,
  });
}
