import { prismaClient } from "../../../prisma/client";

export const getAttachmentsByDFFId = ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.dFFAttachment.findMany({
    where: {
      dematerializedFeasibilityFileId,
    },
    include: {
      file: true,
    },
  });
