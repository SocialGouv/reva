import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
  CandidateTypology,
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
  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

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
      candidacyCandidateInfo: {
        create: {
          street: candidate?.street,
          city: candidate?.city,
          zip: candidate?.zip,
          addressComplement: candidate?.addressComplement,
        },
      },
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
      ccnId: typeAccompagnement === "ACCOMPAGNE" ? candidate?.ccnId : null,
      typology:
        typeAccompagnement === "ACCOMPAGNE"
          ? (candidate?.typology ?? CandidateTypology.NON_SPECIFIE)
          : CandidateTypology.NON_SPECIFIE,
      typologyAdditional:
        typeAccompagnement === "ACCOMPAGNE"
          ? candidate?.typologyAdditional
          : null,
    },
  });
};
