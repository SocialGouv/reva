import { FunctionalCodeError } from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger";
import { prismaClient } from "@/prisma/client";

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
        candidacyDropOut: { include: { dropOutReason: true } },
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

  if (candidacy.candidacyDropOut.dropOutConfirmedByCandidate) {
    throw new Error(`Le candidat a déjà confirmé l'abandon de la candidature`);
  }

  try {
    const candidacyUpdated = await prismaClient.candidacy.update({
      where: { id: params.candidacyId },
      data: {
        candidacyDropOut: { delete: true },
        activite: "ACTIF",
        dateInactifEnAttente: null,
      },
    });
    // On veut retourner le dropout précédent (maintenant supprimé) pour l'utiliser dans les logs
    const previousCandidacyDropOut = candidacy.candidacyDropOut;
    return {
      ...candidacyUpdated,
      candidacyDropOut: previousCandidacyDropOut,
    };
  } catch (e) {
    logger.error(e);
    throw new Error(`${FunctionalCodeError.CANDIDACY_DROP_OUT_FAILED} ${e}`);
  }
};
