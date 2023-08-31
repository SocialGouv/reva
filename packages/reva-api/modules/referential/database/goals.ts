import { Goal } from "@prisma/client";
import { Either, Left, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";

export const getGoals = async (): Promise<Either<string, Goal[]>> => {
  try {
    const goals = await prismaClient.goal.findMany({
      where: {
        isActive: true,
      },
    });

    return Right(goals);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving goals`);
  }
};
