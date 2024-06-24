import { prismaClient } from "../../../prisma/client";

export const getHighestDegreeByCandidateId = ({
  candidateId,
}: {
  candidateId: string;
}) =>
  prismaClient.degree.findFirst({
    where: { id: candidateId },
  });
