import { ActiviteStatut, CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

// Mise à jour de la date d'activité pour toutes les candidatures actives du candidat
export const updateAllCandidaciesDerniereDateActiviteByCandidateId = async ({
  candidateId,
}: {
  candidateId: string;
}) =>
  prismaClient.candidacy.updateMany({
    where: {
      candidateId,
      status: {
        not: CandidacyStatusStep.ARCHIVE,
      },
      candidacyDropOut: { is: null },
      activite: ActiviteStatut.ACTIF,
    },
    data: { derniereDateActivite: new Date() },
  });
