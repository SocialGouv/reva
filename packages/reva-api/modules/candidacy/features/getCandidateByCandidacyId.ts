import { Candidate } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getCandidateByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<Candidate | null> =>
  prismaClient.candidacy.findUnique({ where: { id: candidacyId } }).candidate();
