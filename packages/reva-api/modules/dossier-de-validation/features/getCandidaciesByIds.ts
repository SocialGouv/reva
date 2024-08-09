import { prismaClient } from "../../../prisma/client";

export const getCandidaciesByIds = async ({
  candidacyIds,
}: {
  candidacyIds: string[];
}) =>
  prismaClient.candidacy.findMany({
    where: {
      id: { in: candidacyIds },
    },
  });
