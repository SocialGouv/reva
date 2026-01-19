import { Candidate, CandidateTypology } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const updateCandidateTypologyAndCcn = async (params: {
  candidateId: string;
  typology: CandidateTypology;
  additionalInformation?: string;
  ccnId?: string;
}): Promise<Candidate> => {
  const { candidateId, typology, additionalInformation, ccnId } = params;

  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });
  if (!candidate) {
    throw new Error(`Le candidat n'existe pas`);
  }

  let ccn = null;
  if (ccnId) {
    ccn = await prismaClient.candidacyConventionCollective.findUnique({
      where: { id: ccnId },
    });
    if (!ccn) {
      throw new Error(`La convention collective n'existe pas`);
    }
  }

  const ccnRequired =
    typology === CandidateTypology.SALARIE_PRIVE ||
    typology === CandidateTypology.DEMANDEUR_EMPLOI ||
    typology === CandidateTypology.TRAVAILLEUR_NON_SALARIE ||
    typology === CandidateTypology.TITULAIRE_MANDAT_ELECTIF;

  if (ccnRequired && !ccnId) {
    throw new Error(
      'Les typologies "SALARIE_PRIVE" et "DEMANDEUR_EMPLOI" doivent être associées à une convention collective.',
    );
  }

  const candidacies = await prismaClient.candidacy.findMany({
    where: { candidateId: candidateId },
    select: {
      id: true,
      Feasibility: {
        where: {
          isActive: true,
        },
        select: {
          feasibilityFileSentAt: true,
          dematerializedFeasibilityFile: {
            select: {
              feasibilityFileId: true,
            },
          },
        },
      },
    },
  });

  const candidaciesWithoutFeasibility = candidacies.filter(
    (c) => !c.Feasibility?.[0] || !c.Feasibility?.[0]?.feasibilityFileSentAt,
  );

  const [updatedCandidate] = await prismaClient.$transaction([
    prismaClient.candidate.update({
      where: { id: candidateId },
      data: {
        typology,
        typologyAdditional: additionalInformation,
        ccnId: ccnRequired ? ccnId : null,
      },
    }),
    prismaClient.candidacy.updateMany({
      where: { id: { in: candidaciesWithoutFeasibility.map((c) => c.id) } },
      data: {
        typology,
        typologyAdditional: additionalInformation,
        ccnId: ccnRequired ? ccnId : null,
      },
    }),
  ]);

  return updatedCandidate;
};
