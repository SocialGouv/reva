import { prismaClient } from "@/prisma/client";

export const getCandidacyGoals = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({
      where: { id: candidacyId },
    })
    .goals({ include: { goal: true } })
    .then((goals) => goals?.map((goal) => goal.goal));
