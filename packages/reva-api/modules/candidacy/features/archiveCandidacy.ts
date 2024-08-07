import { getCandidacyById } from "./getCandidacyById";
import { getReorientationReasonById } from "../../referential/features/getReorientationReasonById";
import { prismaClient } from "../../../prisma/client";
import { candidacyIncludes } from "../database/candidacies";
import { logger } from "../../shared/logger";
import {
  FunctionalCodeError,
  // FunctionalError,
} from "../../shared/error/functionalError";

interface ArchiveCandidacyParams {
  candidacyId: string;
  reorientationReasonId: string | null;
}
export const archiveCandidacy = async (params: ArchiveCandidacyParams) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
        candidacyStatuses: true,
      },
    });
  } catch (error) {
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
    candidacy?.candidacyStatuses.find(
      (status) => status.status === "ARCHIVE" && status.isActive,
    ),
  );

  if (isArchived) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED} La candidature est déjà archivée`,
    );
  }

  if (params.reorientationReasonId) {
    try {
      const r = await getReorientationReasonById({
        reorientationReasonId: params.reorientationReasonId || "",
      });
      if (!r) {
        throw new Error(
          `${FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON} "La raison de réorientation n'est pas valide`,
        );
      }
    } catch (error) {
      throw new Error(
        `${FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON} "La raison de réorientation n'est pas valide: ${error}`,
      );
    }
  }

  try {
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
              status: "ARCHIVE",
              isActive: true,
            },
          },
          reorientationReasonId: params.reorientationReasonId,
        },
        include: {
          ...candidacyIncludes,
        },
      }),
    ]);

    return newCandidacy;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de l'archivage de la candidature ${params.candidacyId}`,
    );
  }
};
