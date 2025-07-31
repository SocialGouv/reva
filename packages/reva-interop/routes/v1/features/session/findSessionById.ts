import { prismaClient } from "../../../../prisma/client.js";

export const findSessionById = async (id: string) => {
  const session = await prismaClient.session.findUnique({
    where: { id },
  });

  return session;
};
