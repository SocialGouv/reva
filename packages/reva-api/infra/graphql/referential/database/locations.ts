import { Either, Left, Right } from "purify-ts";

import { prismaClient } from "../../../database/postgres/client";
import { logger } from "../../../logger";
import { Department, Region } from "../referential.types";

export const getRegions = async (): Promise<Either<string, Region[]>> => {
  try {
    const regions = await prismaClient.region.findMany({
      include: {
        departments: true,
      },
    });

    return Right(regions);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving regions`);
  }
};

export const getDepartments = async (): Promise<
  Either<string, Department[]>
> => {
  try {
    const deparments = await prismaClient.department.findMany();

    return Right(deparments);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving deparments`);
  }
};
