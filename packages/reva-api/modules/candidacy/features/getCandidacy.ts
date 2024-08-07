import { prismaClient } from "../../../prisma/client";
import { candidacyIncludes } from "../database/candidacies";

export const getCandidacy = async ({ candidacyId }: { candidacyId: string }) =>
  prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
    include: {
      ...candidacyIncludes,
    },
  });
