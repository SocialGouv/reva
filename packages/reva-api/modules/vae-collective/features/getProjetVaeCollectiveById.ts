import { prismaClient } from "../../../prisma/client";

export const getProjetVaeCollectiveById = ({
  projetVaeCollectiveId,
}: {
  projetVaeCollectiveId?: string;
}) =>
  projetVaeCollectiveId
    ? prismaClient.projetVaeCollective.findUnique({
        where: { id: projetVaeCollectiveId },
      })
    : null;
