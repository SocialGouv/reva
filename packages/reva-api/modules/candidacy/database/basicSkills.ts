import { Either, Left, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import * as domain from "../candidacy.types";

export const getBasicSkills = async (): Promise<
  Either<string, domain.BasicSkill[]>
> => {
  try {
    const basicSkills = await prismaClient.basicSkill.findMany();

    return Right(basicSkills);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving basicSkills`);
  }
};
