import { FunctionalCodeError } from "../../shared/error/functionalError";
import { CandidacyStatusStep } from "@prisma/client";
import { logger } from "../../../modules/shared/logger";
import { prismaClient } from "../../../prisma/client";
import { getCandidacyById } from "./getCandidacyById";

interface UnarchiveCandidacyParams {
  candidacyId: string;
}

export const unarchiveCandidacy = async (params: UnarchiveCandidacyParams) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
        candidacyStatuses: true,
      },
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

  const isArchived = Boolean(
    candidacy.candidacyStatuses.find(
      (status) => status.status === "ARCHIVE" && status.isActive,
    ),
  );

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
    const [, newCandidacy] = await prismaClient.$transaction([
      prismaClient.candidaciesStatus.updateMany({
        where: {
          candidacyId: params.candidacyId,
        },
        data: {
          isActive: false,
        },
      }),
      prismaClient.candidacy.update({
        where: {
          id: params.candidacyId,
        },
        data: {
          candidacyStatuses: {
            create: {
              ...latestStatusBeforeArchive,
              isActive: true,
            },
          },
        },
      }),
    ]);

    return newCandidacy;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `error while updating status on candidacy ${params.candidacyId}`,
    );
  }
};
