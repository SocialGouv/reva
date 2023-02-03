import { Either, Left, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { logger } from "../../logger";
import { prismaClient } from "./client";

export const getDegrees = async (): Promise<
  Either<string, domain.Degree[]>
> => {
  try {
    const degrees = await prismaClient.degree.findMany();

    return Right(degrees);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving degrees`);
  }
};
