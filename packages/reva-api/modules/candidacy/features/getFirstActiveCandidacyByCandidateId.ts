import { prismaClient } from "../../../prisma/client";

export const getFirstActiveCandidacyByCandidateId = ({
  candidateId,
}: {
  candidateId: string;
}) =>
  prismaClient.candidacy.findFirst({
    where: {
      candidateId,
      status: { not: "ARCHIVE" },
    },
  });
