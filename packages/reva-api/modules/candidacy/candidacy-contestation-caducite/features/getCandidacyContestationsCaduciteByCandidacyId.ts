import { prismaClient } from "../../../../prisma/client";

export const getCandidacyContestationsCaduciteByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacyContestationCaducite.findMany({
    where: {
      candidacyId,
    },
  });
