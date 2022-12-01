import { Left, Right } from "purify-ts";

import { prismaClient } from "./client";

export const getTrainings = async () => {
  try {
    const trainings = await prismaClient.training.findMany();

    return Right(trainings);
  } catch (e) {
    return Left(`error while retrieving trainings`);
  }
};
