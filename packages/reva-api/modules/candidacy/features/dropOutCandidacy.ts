import { isCandidacyStatusEqualOrAboveGivenStatus } from "@/modules/candidacy-menu/features/isCandidacyStatusEqualOrAboveGivenStatus";
import { getDropOutReasonById } from "@/modules/referential/features/getDropOutReasonById";
import { FunctionalCodeError } from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { getCandidacyById } from "./getCandidacyById";

interface DropOutCandidacyParams {
  userRoles: KeyCloakUserRole[];
  candidacyId: string;
  dropOutReasonId: string;
  otherReasonContent?: string;
  dropOutConfirmedByCandidate?: boolean;
}

export const dropOutCandidacy = async (params: DropOutCandidacyParams) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
        candidate: true,
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

  const candidacyStatus = candidacy.status;
  const isWaitingForFeasibilityDecision =
    candidacyStatus === "DOSSIER_FAISABILITE_ENVOYE";

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

  if (isWaitingForFeasibilityDecision) {
    throw new Error(
      `La candidature ${params.candidacyId} ne peut pas être abandonnée car le dossier de faisabilité est envoyé et une décision du certificateur est en attente`,
    );
  }

  if (!params.userRoles.includes("admin")) {
    const isFeasibilitySent = isCandidacyStatusEqualOrAboveGivenStatus(
      candidacyStatus,
    )("DOSSIER_FAISABILITE_ENVOYE");

    const isFeasibilityIncomplete =
      candidacyStatus === "DOSSIER_FAISABILITE_INCOMPLET";

    if (!isFeasibilitySent && !isFeasibilityIncomplete) {
      throw new Error(
        "La candidature ne peut être abandonnée car le dossier de faisabilité n'a pas été envoyé",
      );
    }
  }

  try {
    await prismaClient.candidacyDropOut.create({
      data: {
        candidacyId: params.candidacyId,
        status: candidacyStatus,
        dropOutReasonId: params.dropOutReasonId,
        otherReasonContent: params.otherReasonContent || null,
        dropOutConfirmedByCandidate:
          params.dropOutConfirmedByCandidate || false,
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
