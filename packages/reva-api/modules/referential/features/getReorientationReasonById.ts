import { prismaClient } from "../../../prisma/client";
import { ReorientationReason } from "../referential.types";

export const getReorientationReasonById = async (params: {
  reorientationReasonId: string;
}): Promise<ReorientationReason | null> =>
  prismaClient.reorientationReason.findUnique({
    where: {
      id: params.reorientationReasonId,
    },
  });
