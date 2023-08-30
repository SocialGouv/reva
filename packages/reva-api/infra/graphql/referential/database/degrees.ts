import { Either, Left, Right } from "purify-ts";

import { prismaClient } from "../../../database/postgres/client";
import { logger } from "../../../logger";
import { Degree } from "../referential.types";

export const getDegrees = async (): Promise<Either<string, Degree[]>> => {
  try {
    const degrees = await prismaClient.degree.findMany();

    return Right(degrees);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving degrees`);
  }
};
