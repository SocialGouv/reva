import { CANDIDAT_NON_TROUVE } from "@/modules/shared/errors/messages";
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
    throw new Error(CANDIDAT_NON_TROUVE);
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
