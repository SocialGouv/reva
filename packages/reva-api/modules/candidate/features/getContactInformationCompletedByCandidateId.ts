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
    throw new Error(`Le candidat n'existe pas`);
  }

  return (
    candidate.street !== null &&
    candidate.city !== null &&
    candidate.zip !== null &&
    candidate.phone !== null &&
    candidate.email !== null
  );
};
