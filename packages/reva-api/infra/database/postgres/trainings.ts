import { Left, Right } from "purify-ts";

import { logger } from "../../logger";
import { prismaClient } from "./client";

export const getTrainings = async () => {
  try {
    const trainings = await prismaClient.training.findMany();

    return Right(trainings);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving trainings`);
  }
};
