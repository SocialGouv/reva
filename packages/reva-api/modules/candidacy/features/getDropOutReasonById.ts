import { prismaClient } from "../../../prisma/client";

export const getDropOutReasonById = ({
  dropOutReasonId,
}: {
  dropOutReasonId: string;
}) =>
  dropOutReasonId
    ? prismaClient.dropOutReason.findUnique({ where: { id: dropOutReasonId } })
    : null;
