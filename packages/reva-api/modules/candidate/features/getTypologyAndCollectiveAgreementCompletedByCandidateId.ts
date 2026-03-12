import { CandidateTypology } from "@prisma/client";

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
    throw new Error(`Le candidat n'existe pas`);
  }

  return (
    candidate.typology !== CandidateTypology.NON_SPECIFIE &&
    candidate.ccnId !== null
  );
};
