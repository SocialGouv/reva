import { prismaClient } from "@/prisma/client";

import { Candidate } from "../candidate.types";

export const getCandidateByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<Candidate | null> =>
  prismaClient.candidacy
    .findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        candidate: true,
      },
    })
    .then((candidacy) => candidacy?.candidate ?? null);
