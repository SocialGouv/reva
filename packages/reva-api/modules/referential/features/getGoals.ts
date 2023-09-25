import { Goal } from "@prisma/client";
import { Either, Left, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";

export const getGoals = async (): Promise<Goal[]> =>
  prismaClient.goal.findMany({
    where: {
      isActive: true,
    },
  });
