import { prismaClient } from "../../../prisma/client";
import { Region } from "../referential.types";

export const getRegions = (): Promise<Region[]> =>
  prismaClient.region.findMany();
