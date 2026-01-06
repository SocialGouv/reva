import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
  Prisma,
} from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createCandidacy = async ({
  candidateId,
  typeAccompagnement,
  certificationId,
  cohorteVaeCollectiveId,
  tx,
}: {
  candidateId: string;
  typeAccompagnement?: CandidacyTypeAccompagnement;
  certificationId?: string;
  cohorteVaeCollectiveId?: string;
  tx?: Prisma.TransactionClient;
}) => {
  const prisma = tx ?? prismaClient;
  // Row-level lock per candidate to avoid duplicate candidacies under concurrency
  // If a diffrent transaction tries to aquire the lock while the first one still holds it, it will fail and rollback
  await prisma.$queryRaw`SELECT id FROM candidate WHERE id = ${candidateId}::uuid FOR UPDATE NOWAIT`;
  return prisma.candidacy.create({
    data: {
      typeAccompagnement,
      candidateId,
      certificationId,
      admissibility: { create: {} },
      examInfo: { create: {} },
      status: "PROJET",
      financeModule: "hors_plateforme",
      cohorteVaeCollectiveId,
      feasibilityFormat:
        typeAccompagnement === "AUTONOME" ? "UPLOADED_PDF" : "DEMATERIALIZED",
      candidacyStatuses: {
        create: {
          status: CandidacyStatusStep.PROJET,
        },
      },
    },
  });
};
