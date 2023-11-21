import { prismaClient } from "../../../prisma/client";

export const getAccountByKeycloakId = ({
  keycloakId,
}: {
  keycloakId: string;
}) => prismaClient.account.findFirst({ where: { keycloakId } });
