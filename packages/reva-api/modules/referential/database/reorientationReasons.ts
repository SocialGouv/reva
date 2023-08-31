import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { ReorientationReason } from "../referential.types";

export const getReorientationReasons = async (): Promise<
  Either<string, ReorientationReason[]>
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
}): Promise<Either<string, Maybe<ReorientationReason>>> => {
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
