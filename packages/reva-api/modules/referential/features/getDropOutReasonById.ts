import { prismaClient } from "../../../prisma/client";
import { DropOutReason } from "../referential.types";

export const getDropOutReasonById = (params: {
  dropOutReasonId: string;
}): Promise<DropOutReason | null> =>
  prismaClient.dropOutReason.findUnique({
    where: {
      id: params.dropOutReasonId,
    },
  });
