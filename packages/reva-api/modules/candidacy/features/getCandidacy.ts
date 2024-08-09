import { prismaClient } from "../../../prisma/client";

export const getCandidacy = async ({ candidacyId }: { candidacyId: string }) =>
  prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
  });
