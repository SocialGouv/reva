import { Either, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { prismaClient } from "./client";

export const getReorientationReasons = async (): Promise<
  Either<string, domain.ReorientationReason[]>
> => {
  try {
    const reorientationReasons =
      await prismaClient.reorientationReason.findMany();

    return Right(reorientationReasons);
  } catch (e) {
    return Left(`error while retrieving reorientation reasons`);
  }
};

export const getReorientationReasonById = async (params: {
  reorientationReasonId: string | null;
}): Promise<Either<string, Maybe<domain.ReorientationReason>>> => {
  if (!params.reorientationReasonId) {
    return Left(`error while retrieving reorientation reason`);
  }
  try {
    const reorientationReason =
      await prismaClient.reorientationReason.findUnique({
        where: {
          id: params.reorientationReasonId,
        },
      });

    return Right(Maybe.fromNullable(reorientationReason));
  } catch (e) {
    return Left(`error while retrieving reorientation reason`);
  }
};
