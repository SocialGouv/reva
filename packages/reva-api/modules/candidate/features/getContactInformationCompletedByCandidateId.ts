import { CANDIDAT_NON_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const getContactInformationCompletedByCandidateId = async ({
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

  return (
    candidate.street !== null &&
    candidate.city !== null &&
    candidate.zip !== null &&
    candidate.phone !== null &&
    candidate.email !== null
  );
};
