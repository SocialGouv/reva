import { Candidate } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getCandidateByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<Candidate | null> =>
  prismaClient.candidate.findFirst({
    where: { candidacies: { some: { id: candidacyId } } },
  });
