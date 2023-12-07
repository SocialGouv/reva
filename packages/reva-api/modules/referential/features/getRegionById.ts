import { Region } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getRegionById = ({ id }: { id: string }): Promise<Region | null> =>
  prismaClient.region.findUnique({ where: { id } });
