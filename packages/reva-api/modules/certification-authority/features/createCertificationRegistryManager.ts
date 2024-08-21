import { Account } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { createAccount } from "../../account/features/createAccount";
import { FunctionalError } from "../../shared/error/functionalError";

export const createCertificationRegistryManager = async ({
  accountFirstname,
  accountLastname,
  accountEmail,
  certificationAuthorityStructureId,
}: {
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  certificationAuthorityStructureId: string;
}) => {
  let account: Account | undefined;

  try {
    account = await createAccount({
      firstname: accountFirstname,
      lastname: accountLastname,
      email: accountEmail,
      username: accountEmail,
      group: "certification_registry_manager",
    });
  } catch (error) {
    const errorMessage = (error as FunctionalError).message;
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  if (!account) {
    throw new Error(
      "Impossible de créer le compte du responsable du référentiel",
    );
  }

  return prismaClient.certificationRegistryManager.create({
    data: {
      accountId: account.id,
      certificationAuthorityStructureId: certificationAuthorityStructureId,
    },
  });
};
