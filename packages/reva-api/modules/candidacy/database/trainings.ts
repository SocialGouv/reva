import { Left, Right } from "purify-ts";

import { prismaClient } from "../../../infra/database/postgres/client";
import { logger } from "../../../infra/logger";

export const getTrainings = async () => {
  try {
    const trainings = await prismaClient.training.findMany();

    return Right(trainings);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving trainings`);
  }
};

export const getAfgsuTrainingId = async () =>
  (
    await prismaClient.training.findFirst({
      where: {
        label:
          "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)",
      },
    })
  )?.id || null;
