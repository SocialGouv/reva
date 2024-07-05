import { prismaClient } from "../../../prisma/client";
import { Account } from ".prisma/client";

export const createAccountProfile = async (params: {
  email: string;
  firstname: string;
  lastname: string;
  organismId?: string;
  keycloakId: string;
  certificationAuthorityId?: string;
}): Promise<Account> =>
  prismaClient.account.create({
    data: {
      keycloakId: params.keycloakId,
      email: params.email,
      firstname: params.firstname,
      lastname: params.lastname,
      organismId: params.organismId,
      certificationAuthorityId: params.certificationAuthorityId,
    },
  });

export const getAccountFromEmail = async (email: string) =>
  prismaClient.account.findUnique({
    where: {
      email,
    },
  });
