import { Either, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { logger } from "../../logger";
import { prismaClient } from "./client";

export const getAdmissibilityFromCandidacyId = async (params: {
  candidacyId: string;
}): Promise<Either<string, Maybe<domain.Admissibility>>> => {
  try {
    const admissibility = await prismaClient.admissibility.findUnique({
      where: {
        candidacyId: params.candidacyId,
      },
    });

    return Right(Maybe.fromNullable(admissibility));
  } catch (e) {
    logger.error(e);
    return Left(
      `error while retrieving admissibility for candidacy with id ${params.candidacyId}`
    );
  }
};

export const updateAdmissibility = async (params: {
  admissibilityId: string;
  admissibility: domain.Admissibility;
}): Promise<Either<string, domain.Admissibility>> => {
  try {
    return Right(
      await prismaClient.admissibility.update({
        where: { id: params.admissibilityId },
        data: params.admissibility,
      })
    );
  } catch (e) {
    logger.error(e);
    return Left(
      `error while creating admissibility with id ${params.admissibilityId}`
    );
  }
};
