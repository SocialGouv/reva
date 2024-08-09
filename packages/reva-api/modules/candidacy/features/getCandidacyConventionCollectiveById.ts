import { prismaClient } from "../../../prisma/client";

export const getCandidacyConventionCollectiveById = ({
  ccnId,
}: {
  ccnId: string;
}) =>
  ccnId
    ? prismaClient.candidacyConventionCollective.findUnique({
        where: { id: ccnId },
      })
    : null;
