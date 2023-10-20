import { prismaClient } from "../../prisma/client";

export const activeFeaturesForConnectedUser = async () =>
  (await prismaClient.feature.findMany({ where: { isActive: true } })).map(
    (f) => f.key
  );
