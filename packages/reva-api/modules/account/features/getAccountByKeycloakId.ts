import { prismaClient } from "@/prisma/client";

export const getAccountByKeycloakId = ({
  keycloakId,
}: {
  keycloakId: string;
}) =>
  keycloakId
    ? prismaClient.account.findUnique({ where: { keycloakId } })
    : null;
