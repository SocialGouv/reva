import { prismaClient } from "../../../../prisma/client.js";

export const createSession = async (params: { keycloakId: string }) => {
  const session = await prismaClient.session.create({
    data: {
      keycloakId: params.keycloakId,
    },
  });

  return session;
};
