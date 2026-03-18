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

  const country = candidate.countryId
    ? await prismaClient.country.findUnique({
        where: {
          id: candidate.countryId,
        },
      })
    : null;

  return (
    candidate.firstname !== null &&
    candidate.lastname !== null &&
    candidate.gender !== null &&
    candidate.birthCity !== null &&
    candidate.birthdate !== null &&
    candidate.nationality !== null &&
    ((country?.isoCode === "FRA" && candidate.birthDepartmentId !== null) ||
      (country !== null &&
        country.isoCode !== "FRA" &&
        candidate.birthDepartmentId === null))
  );
};
