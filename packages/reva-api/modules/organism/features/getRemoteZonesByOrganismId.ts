import { prismaClient } from "@/prisma/client";

export const getRemoteZonesByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => prismaClient.organismOnRemoteZone.findMany({ where: { organismId } });
