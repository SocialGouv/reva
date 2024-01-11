import { Candidacy } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getCandidacyById = ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<Candidacy | null> =>
  prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
