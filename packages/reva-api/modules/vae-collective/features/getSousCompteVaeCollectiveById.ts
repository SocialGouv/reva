import { prismaClient } from "@/prisma/client";

export const getSousCompteVaeCollectiveById = ({
  sousCompteVaeCollectiveId,
}: {
  sousCompteVaeCollectiveId: string;
}) =>
  prismaClient.sousCompteVaeCollective.findUnique({
    where: {
      id: sousCompteVaeCollectiveId,
    },
  });
