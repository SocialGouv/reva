import { Either, Left, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { prismaClient } from "./client";

export const getDropOutReasons = async (): Promise<
  Either<string, domain.DropOutReason[]>
> => {
  try {
    const dropOutReasons =
      await prismaClient.dropOutReason.findMany();

    return Right(dropOutReasons);
  } catch (e) {
    return Left(`error while retrieving drop out reasons`);
  }
};
