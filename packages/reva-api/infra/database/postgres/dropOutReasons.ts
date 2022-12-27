import { Either, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { prismaClient } from "./client";

export const getDropOutReasons = async (): Promise<
  Either<string, domain.DropOutReason[]>
> => {
  try {
    const dropOutReasons = await prismaClient.dropOutReason.findMany();

    return Right(dropOutReasons);
  } catch (e) {
    return Left(`error while retrieving drop out reasons`);
  }
};

export const getDropOutReasonById = async (params: {
  dropOutReasonId: string;
}): Promise<Either<string, Maybe<domain.DropOutReason>>> => {
  try {
    const dropOutReason = await prismaClient.dropOutReason.findUnique({
      where: {
        id: params.dropOutReasonId,
      },
    });

    return Right(Maybe.fromNullable(dropOutReason));
  } catch (e) {
    return Left(`error while retrieving drop out reason`);
  }
};
