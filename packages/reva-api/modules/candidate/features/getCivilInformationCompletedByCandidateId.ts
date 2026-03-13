import { prismaClient } from "@/prisma/client";

export const getCivilInformationCompletedByCandidateId = async ({
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
    candidate.firstname !== null &&
    candidate.lastname !== null &&
    candidate.gender !== null &&
    candidate.birthCity !== null &&
    candidate.birthDepartmentId !== null &&
    candidate.birthdate !== null &&
    candidate.countryId !== null &&
    candidate.nationality !== null
  );
};
