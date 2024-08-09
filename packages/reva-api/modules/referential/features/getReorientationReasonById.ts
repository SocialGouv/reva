import { prismaClient } from "../../../prisma/client";

export const getReorientationReasonById = async ({
  reorientationReasonId,
}: {
  reorientationReasonId: string;
}) =>
  reorientationReasonId
    ? prismaClient.reorientationReason.findUnique({
        where: {
          id: reorientationReasonId,
        },
      })
    : null;
