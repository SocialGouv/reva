import { prismaClient } from "../../../prisma/client";

export const getFirstActiveCandidacyByCandidateId = ({
  candidateId,
}: {
  candidateId: string;
}) =>
  prismaClient.candidacy.findFirst({
    where: {
      candidateId,
      candidacyStatuses: {
        none: {
          OR: [{ status: "ARCHIVE", isActive: true }],
        },
      },
    },
  });
