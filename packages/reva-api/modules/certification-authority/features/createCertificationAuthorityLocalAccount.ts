import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { Account } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { createAccount } from "../../account/features/createAccount";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { FunctionalError } from "../../shared/error/functionalError";

export const createCertificationAuthorityLocalAccount = async ({
  accountFirstname,
  accountLastname,
  accountEmail,
  departmentIds,
  certificationIds,
  certificationAuthorityKeycloakId,
  keycloakAdmin,
}: {
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  departmentIds: string[];
  certificationIds: string[];
  keycloakAdmin: KeycloakAdminClient;
  certificationAuthorityKeycloakId: string;
}) => {
  const certificationAuthorityAccount = await getAccountByKeycloakId({
    keycloakId: certificationAuthorityKeycloakId,
  });

  if (!certificationAuthorityAccount) {
    throw new Error(
      "Erreur pendant la récupération du compte de l'utiliseur de l'autorité de certification"
    );
  }

  const certificationAuthority =
    await prismaClient.certificationAuthority.findFirst({
      where: {
        id: certificationAuthorityAccount?.certificationAuthorityId || "",
      },
    });

  if (!certificationAuthority) {
    throw new Error(
      "Erreur pendant la récupération de l'autorité de certification"
    );
  }

  let account: Account | undefined;

  try {
    account = await createAccount({
      firstname: accountFirstname,
      lastname: accountLastname,
      email: accountEmail,
      username: accountEmail,
      keycloakAdmin,
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

  return prismaClient.certificationAuthorityLocalAccount.create({
    data: {
      accountId: account.id,
      certificationAuthorityId: certificationAuthority?.id,
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
};
