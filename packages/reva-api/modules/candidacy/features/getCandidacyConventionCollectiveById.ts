import { prismaClient } from "../../../prisma/client";

export const getCandidacyConventionCollectiveById = ({
  ccnId,
}: {
  ccnId: string;
}) =>
  prismaClient.candidacyConventionCollective.findUnique({
    where: { id: ccnId },
  });
