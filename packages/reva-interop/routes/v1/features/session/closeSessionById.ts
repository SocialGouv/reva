import { prismaClient } from "../../../../prisma/client.js";

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
