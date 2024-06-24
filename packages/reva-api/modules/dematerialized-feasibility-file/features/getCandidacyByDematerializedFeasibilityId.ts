import { prismaClient } from "../../../prisma/client";

export const getCandidacyWithCandidateByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
