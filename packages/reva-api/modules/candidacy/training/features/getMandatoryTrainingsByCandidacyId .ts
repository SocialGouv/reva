import { prismaClient } from "@/prisma/client";
export const getMandatoryTrainingsByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  (
    await prismaClient.candidacy
      .findUnique({ where: { id: candidacyId } })
      .trainings({ include: { training: true } })
  )?.map((t) => t.training) || [];
