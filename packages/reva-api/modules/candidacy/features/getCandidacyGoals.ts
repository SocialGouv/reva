import { prismaClient } from "../../../prisma/client";

export const getCandidacyGoals = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  (
    await prismaClient.candicadiesOnGoals.findMany({
      where: { candidacyId },
      include: { goal: true },
    })
  ).map((cog) => cog.goal);
