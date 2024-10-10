import { FunctionalCodeError } from "../../shared/error/functionalError";
import { getCandidacyById } from "./getCandidacyById";
import { logger } from "../../shared/logger";
import { prismaClient } from "../../../prisma/client";

interface ValidateDropOutCandidacyParams {
  candidacyId: string;
}

export const validateDropOutCandidacy = async (
  params: ValidateDropOutCandidacyParams,
) => {
  let candidacy;
  try {
    candidacy = await getCandidacyById({
      candidacyId: params.candidacyId,
      includes: {
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

  try {
    await prismaClient.candidacyDropOut.update({
      where: { candidacyId: candidacy.id },
      data: {
        proofReceivedByAdmin: true,
        validatedAt: new Date(),
      },
    });
    return candidacy;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `error on validate drop out of candidacy ${params.candidacyId}: ${(e as Error).message}`,
    );
  }
};
