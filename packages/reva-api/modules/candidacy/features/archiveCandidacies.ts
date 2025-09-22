import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { ArchiveCandidaciesParams } from "../candidacy.types";

export const archiveCandidacies = async (params: ArchiveCandidaciesParams) => {
  const candidaciesToArchive = await prismaClient.candidacy.findMany({
    where: {
      id: {
        in: params.candidacyIds,
      },
      status: {
        not: "ARCHIVE",
      },
    },
    select: {
      id: true,
    },
  });

  if (candidaciesToArchive.length === 0) {
    return [];
  }

  const candidaciesToArchiveIds = candidaciesToArchive.map(
    (candidacy) => candidacy.id,
  );

  try {
    return prismaClient.$transaction(async (tx) => {
      await tx.candidacy.updateMany({
        where: {
          id: {
            in: candidaciesToArchiveIds,
          },
        },
        data: {
          status: "ARCHIVE",
          archivingReason: params.archivingReason,
          archivingReasonAdditionalInformation:
            params.archivingReasonAdditionalInformation || null,
        },
      });

      await tx.candidaciesStatus.createMany({
        data: candidaciesToArchive.map((candidacy) => ({
          candidacyId: candidacy.id,
          status: "ARCHIVE",
        })),
      });
    });
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de l'archivage des candidatures ${params.candidacyIds.join(", ")}`,
    );
  }
};
