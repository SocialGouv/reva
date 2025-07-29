import { prismaClient } from "../prisma/client.js";

export const findSessionById = async (id: string) => {
  const session = await prismaClient.session.findUnique({
    where: { id },
  });

  return session;
};

export const createSession = async (params: { keycloakId: string }) => {
  const session = await prismaClient.session.create({
    data: {
      keycloakId: params.keycloakId,
    },
  });

  return session;
};

// eslint-disable-next-line import/no-unused-modules
export const closeSessionById = async (id: string) => {
  const session = await prismaClient.session.update({
    where: {
      id,
    },
    data: {
      endedAt: new Date(),
    },
  });

  return session;
};
