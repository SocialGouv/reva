import { Goal } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getGoals = async (): Promise<Goal[]> =>
  prismaClient.goal.findMany({
    where: {
      isActive: true,
    },
  });
