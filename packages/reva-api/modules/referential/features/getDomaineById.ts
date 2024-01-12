import { prismaClient } from "../../../prisma/client";

export const getDomaineById = ({ domaineId }: { domaineId: string }) =>
  prismaClient.domaine.findFirstOrThrow({
    where: { id: domaineId },
  });
