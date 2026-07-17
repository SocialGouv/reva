import { CandidateTypology } from "@prisma/client";

import { CANDIDAT_NON_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const getTypologyAndCollectiveAgreementCompletedByCandidateId = async ({
  candidateId,
}: {
  candidateId: string;
}): Promise<boolean> => {
  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error(CANDIDAT_NON_TROUVE);
  }

  const { typology, ccnId } = candidate;

  if (
    typology === CandidateTypology.SALARIE_PRIVE ||
    typology === CandidateTypology.DEMANDEUR_EMPLOI ||
    typology === CandidateTypology.TRAVAILLEUR_NON_SALARIE ||
    typology === CandidateTypology.TITULAIRE_MANDAT_ELECTIF ||
    typology === CandidateTypology.AIDANTS_FAMILIAUX_AGRICOLES
  ) {
    return ccnId !== null;
  }

  return typology !== CandidateTypology.NON_SPECIFIE;
};
