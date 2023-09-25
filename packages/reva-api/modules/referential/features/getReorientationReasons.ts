import { prismaClient } from "../../../prisma/client";
import { ReorientationReason } from "../referential.types";

export const getReorientationReasons = (): Promise<ReorientationReason[]> =>
  prismaClient.reorientationReason.findMany();
