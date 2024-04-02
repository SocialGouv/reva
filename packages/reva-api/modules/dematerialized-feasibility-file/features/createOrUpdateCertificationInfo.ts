import { prismaClient } from "../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "../dematerialized-feasibility-file.types";

export const createOrUpdateCertificationInfo = async ({
  input,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
}) => {
  const currentFile =
    await prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { candidacyId: input.candidacyId },
    });

  return currentFile
    ? prismaClient.dematerializedFeasibilityFile.update({
        where: { id: currentFile.id },
        data: input,
      })
    : prismaClient.dematerializedFeasibilityFile.create({ data: input });
};
