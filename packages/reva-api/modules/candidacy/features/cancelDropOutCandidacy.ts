import { logger } from "../../shared/logger";
import { prismaClient } from "../../../prisma/client";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { getCandidacyById } from "./getCandidacyById";

interface CancelDropOutCandidacyParams {
  candidacyId: string;
}

export const cancelDropOutCandidacy = async (
  params: CancelDropOutCandidacyParams,
) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
        candidacyDropOut: true,
      },
    });
  } catch (e) {
    throw new Error(`${FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST} ${e}`);
  }

  if (!candidacy) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST} La candidature ${params.candidacyId} n'existe pas`,
    );
  }

  if (!candidacy.candidacyDropOut) {
    throw new Error(
      `${FunctionalCodeError.CANDIDACY_NOT_DROPPED_OUT} La candidature n'est pas abandonnée`,
    );
  }

  if (candidacy.candidacyDropOut.proofReceivedByAdmin) {
    throw new Error(
      `Un administrateur a déjà validé l'abandon de la candidature`,
    );
  }

  if (candidacy.candidacyDropOut.dropOutConfirmedByCandidate) {
    throw new Error(`Le candidat a déjà confirmé l'abandon de la candidature`);
  }

  try {
    const candidacyDropOut = await prismaClient.candidacyDropOut.delete({
      where: {
        candidacyId: params.candidacyId,
      },
      include: {
        dropOutReason: true,
      },
    });
    return {
      ...candidacy,
      candidacyDropOut,
    };
  } catch (e) {
    logger.error(e);
    throw new Error(`${FunctionalCodeError.CANDIDACY_DROP_OUT_FAILED} ${e}`);
  }
};
