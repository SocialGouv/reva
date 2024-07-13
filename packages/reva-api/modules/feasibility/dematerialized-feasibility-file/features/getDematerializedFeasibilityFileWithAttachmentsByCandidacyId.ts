import { prismaClient } from "../../../../prisma/client";

export const getDematerializedFeasibilityFileWithAttachmentsByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { feasibility: { candidacyId, isActive: true } },
    include: {
      attachments: { include: { file: true } },
    },
  });
