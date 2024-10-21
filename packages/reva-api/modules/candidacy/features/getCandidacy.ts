import { prismaClient } from "../../../prisma/client";

export const getCandidacy = async ({ candidacyId }: { candidacyId: string }) =>
  candidacyId
    ? prismaClient.candidacy.findUnique({
        where: {
          id: candidacyId,
        },
      })
    : null;
