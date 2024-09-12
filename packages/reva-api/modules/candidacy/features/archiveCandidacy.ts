import { getCandidacyById } from "./getCandidacyById";
import { getReorientationReasonById } from "../../referential/features/getReorientationReasonById";
import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import {
  FunctionalCodeError,
  // FunctionalError,
} from "../../shared/error/functionalError";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

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

  const isArchived = candidacy.status === "ARCHIVE";

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
    return prismaClient.$transaction(async (tx) => {
      await updateCandidacyStatus({
        candidacyId: candidacy.id,
        status: "ARCHIVE",
        tx,
      });

      return tx.candidacy.update({
        where: {
          id: params.candidacyId,
        },
        data: {
          reorientationReasonId: params.reorientationReasonId,
        },
      });
    });
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de l'archivage de la candidature ${params.candidacyId}`,
    );
  }
};
