import { Either, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { logger } from "../../logger";
import { prismaClient } from "./client";

export const getExamInfoFromCandidacyId = async (params: {
  candidacyId: string;
}): Promise<Either<string, Maybe<domain.ExamInfo>>> => {
  try {
    const examInfo = await prismaClient.examInfo.findUnique({
      where: {
        candidacyId: params.candidacyId,
      },
    });

    return Right(Maybe.fromNullable(examInfo));
  } catch (e) {
    logger.error(e);
    return Left(
      `error while retrieving exam information for candidacy with id ${params.candidacyId}`
    );
  }
};

export const updateExamInfo = async (params: {
  examInfo: domain.ExamInfo;
}): Promise<Either<string, domain.ExamInfo>> => {
  try {
    return Right(
      await prismaClient.examInfo.update({
        where: { id: params.examInfo.id },
        data: params.examInfo,
      })
    );
  } catch (e) {
    logger.error(e);
    return Left(
      `error while creating exam information with id ${params.examInfo.id}`
    );
  }
};
