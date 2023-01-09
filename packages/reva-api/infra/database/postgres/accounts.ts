import pino from "pino";
import { Left, Right } from "purify-ts";

import { prismaClient } from "./client";

const logger = pino();

export const createAccountProfile = async (params: {
  email: string;
  firstname: string;
  lastname: string;
  organismId: string;
  keycloakId: string;
}) => {
  try {
    const account = await prismaClient.account.create({
      data: {
        keycloakId: params.keycloakId,
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        organismId: params.organismId,
      },
    });

    return Right(account);
  } catch (e) {
    return Left("error while creating account");
  }
};

export const getAccountFromKeycloakId = async (
  keycloakId: string
) /*: Promise<Either<string, Maybe<Account>>>*/ => {
  try {
    const account = await prismaClient.account.findUnique({
      where: {
        keycloakId,
      },
    });
    // return Right(Maybe.fromNullable(account));
    if (!account) {
      return Left(`Account with keycloakId ${keycloakId} not found.`);
    }
    return Right(account);
  } catch (e) {
    logger.error(e);
    return Left(`Error while looking up account with keycloakId ${keycloakId}`);
  }
};
