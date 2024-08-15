import { Candidate } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getCandidateById = ({
  candidateId,
}: {
  candidateId: string;
}): Promise<Candidate | null> =>
  prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });
