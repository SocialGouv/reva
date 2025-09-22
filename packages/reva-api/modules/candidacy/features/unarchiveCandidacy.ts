import { CandidacyStatusStep } from "@prisma/client";

import { FunctionalCodeError } from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { getCandidacyById } from "./getCandidacyById";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

interface UnarchiveCandidacyParams {
  candidacyId: string;
}

export const unarchiveCandidacy = async (params: UnarchiveCandidacyParams) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
    });
  } catch (error) {
    logger.error(error);
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST} La candidature ${params.candidacyId} n'a pas pu être récupérée: ${error}`,
    );
  }
  if (!candidacy) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST} La candidature ${params.candidacyId} n'existe pas`,
    );
  }

  const isArchived = candidacy.status === "ARCHIVE";

  if (!isArchived) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED} La candidature n'est pas archivée`,
    );
  }

  const isReorientation = Boolean(candidacy.reorientationReasonId);
  if (isReorientation) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_IS_REORIENTATION} Impossible de restaurer la candidature : la candidat a été réorienté.`,
    );
  }

  try {
    const latestStatusBeforeArchive =
      await prismaClient.candidaciesStatus.findFirst({
        where: {
          candidacyId: params.candidacyId,
          status: { not: CandidacyStatusStep.ARCHIVE },
        },
        select: {
          status: true,
        },
        orderBy: [{ createdAt: "desc" }],
      });

    if (!latestStatusBeforeArchive) {
      throw new Error("Statut de la candidature avant archivage non trouvé");
    }

    const newCandidacy = await prismaClient.$transaction(async (tx) => {
      await tx.candidacy.update({
        where: {
          id: params.candidacyId,
        },
        data: {
          archivingReason: null,
          archivingReasonAdditionalInformation: null,
          reorientationReasonId: null,
        },
      });
      return updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: latestStatusBeforeArchive.status,
        tx,
      });
    });

    return newCandidacy;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `error while updating status on candidacy ${params.candidacyId}`,
    );
  }
};
