import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import { Account } from ".prisma/client";

export const createAccountProfile = async (params: {
  email: string;
  firstname: string;
  lastname: string;
  organismId?: string;
  keycloakId: string;
  certificationAuthorityId?: string;
}): Promise<Either<string, Account>> => {
  try {
    const account = await prismaClient.account.create({
      data: {
        keycloakId: params.keycloakId,
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        organismId: params.organismId,
        certificationAuthorityId: params.certificationAuthorityId,
      },
    });

    return Right(account);
  } catch (e) {
    logger.error(e);
    return Left("error while creating account");
  }
};

export const getAccountFromKeycloakId = async (keycloakId: string) => {
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

export const getAccountFromEmail = async (email: string) => {
  try {
    const account = await prismaClient.account.findUnique({
      where: {
        email,
      },
    });
    return Right(Maybe.fromNullable(account));
  } catch (e: unknown) {
    const errorMessage = `Error while retrieving account from email - ${e}`;
    logger.error(errorMessage);
    return Left(errorMessage);
  }
};
