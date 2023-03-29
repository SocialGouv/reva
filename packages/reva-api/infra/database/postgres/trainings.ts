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

export const getAfgsuTrainingId = async () =>
  (
    await prismaClient.training.findFirst({
      where: {
        label: "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)",
      },
    })
  )?.id || null;
