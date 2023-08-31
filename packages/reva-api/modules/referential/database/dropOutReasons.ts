import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import { DropOutReason } from "../referential.types";

export const getDropOutReasons = async (): Promise<
  Either<string, DropOutReason[]>
> => {
  try {
    const dropOutReasons = await prismaClient.dropOutReason.findMany();

    return Right(dropOutReasons);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving drop out reasons`);
  }
};

export const getDropOutReasonById = async (params: {
  dropOutReasonId: string;
}): Promise<Either<string, Maybe<DropOutReason>>> => {
  try {
    const dropOutReason = await prismaClient.dropOutReason.findUnique({
      where: {
        id: params.dropOutReasonId,
      },
    });

    return Right(Maybe.fromNullable(dropOutReason));
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving drop out reason`);
  }
};
