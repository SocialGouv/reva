import { prismaClient } from "../../../prisma/client";

export const getDematerializedFeasibilityFileByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { candidacyId },
  });
