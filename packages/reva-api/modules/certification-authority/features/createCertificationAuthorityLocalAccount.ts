import { Account } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { createAccount } from "../../account/features/createAccount";
import { FunctionalError } from "../../shared/error/functionalError";
import { CreateCertificationAuthorityLocalAccountInput } from "../certification-authority.types";
import { assignCandidaciesToCertificationAuthorityLocalAccount } from "./assignCandidaciesToCertificationAuthorityLocalAccount";

export const createCertificationAuthorityLocalAccount = async ({
  certificationAuthorityId,
  accountFirstname,
  accountLastname,
  accountEmail,
  departmentIds,
  certificationIds,
  contactFullName,
  contactEmail,
  contactPhone,
}: CreateCertificationAuthorityLocalAccountInput) => {
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: {
        id: certificationAuthorityId,
      },
    });

  if (!certificationAuthority) {
    throw new Error(
      "Erreur pendant la récupération de l'autorité de certification",
    );
  }

  let account: Account | undefined;

  try {
    account = await createAccount({
      firstname: accountFirstname,
      lastname: accountLastname,
      email: accountEmail,
      username: accountEmail,
      group: "certification_authority_local_account",
    });
  } catch (error) {
    const errorMessage = (error as FunctionalError).message;
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  if (!account) {
    throw new Error("Erreur pendant la création du compte certificateur local");
  }

  const createdCertificationAuthorityLocalAccount =
    await prismaClient.certificationAuthorityLocalAccount.create({
      data: {
        accountId: account.id,
        certificationAuthorityId: certificationAuthority?.id,
        contactFullName,
        contactEmail,
        contactPhone,
        certificationAuthorityLocalAccountOnCertification: {
          createMany: {
            data: certificationIds.map((certificationId) => ({
              certificationId,
            })),
          },
        },
        certificationAuthorityLocalAccountOnDepartment: {
          createMany: {
            data: departmentIds.map((departmentId) => ({ departmentId })),
          },
        },
      },
    });

  // assign candidacies to created certification authority local account
  await assignCandidaciesToCertificationAuthorityLocalAccount({
    certificationAuthorityLocalAccountId:
      createdCertificationAuthorityLocalAccount.id,
  });

  return createdCertificationAuthorityLocalAccount;
};
