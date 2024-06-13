import { prismaClient } from "../../../prisma/client";

export const getDematerializedFeasibilityFileWithAttachmentsByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { candidacyId },
    include: {
      dffFiles: { include: { file: true } },
    },
  });
