import { FunctionalCodeError } from "../../shared/error/functionalError";
import { getCandidacyById } from "./getCandidacyById";
import { logger } from "../../shared/logger";
import { getDropOutReasonById } from "../../referential/features/getDropOutReasonById";
import { prismaClient } from "../../../prisma/client";

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  droppedOutAt: Date;
  otherReasonContent?: string;
}

export const dropOutCandidacy = async (params: DropOutCandidacyParams) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
        candidate: true,
        candidacyStatuses: {
          where: {
            isActive: true,
          },
        },
        department: true,
        experiences: true,
        goals: true,
        candidacyDropOut: {
          include: {
            dropOutReason: true,
          },
        },
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

  candidacy.email = candidacy.candidate?.email || candidacy.email;
  const candidacyStatus = candidacy.candidacyStatuses[0].status;

  const hasDropOut = Boolean(candidacy.candidacyDropOut);

  if (hasDropOut) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_ALREADY_DROPPED_OUT} La candidature est déjà abandonnée`,
    );
  }

  let dropoutReason;
  try {
    dropoutReason = await getDropOutReasonById({
      dropOutReasonId: params.dropOutReasonId || "",
    });
    if (!dropoutReason) {
      throw new Error(
        `${FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON} La raison d'abandon n'est pas valide`,
      );
    }
  } catch (error) {
    logger.error(error);
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON} La raison d'abandon ${params.dropOutReasonId} n'a pas pu être sélectionnée: ${error}`,
    );
  }

  try {
    await prismaClient.candidacyDropOut.create({
      data: {
        candidacyId: params.candidacyId,
        droppedOutAt: params.droppedOutAt,
        status: candidacyStatus,
        dropOutReasonId: params.dropOutReasonId,
        otherReasonContent: params.otherReasonContent || null,
      },
    });
    return candidacy;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `error on drop out candidacy ${params.candidacyId}: ${(e as Error).message}`,
    );
  }
};
