import { updateAccountById } from "@/modules/account/features/updateAccount";
import { prismaClient } from "@/prisma/client";

import { UpdateCertificationAuthorityLocalAccountGeneralInformationInput } from "../certification-authority.types";

export const updateCertificationAuthorityLocalAccountGeneralInformation =
  async ({
    input: {
      certificationAuthorityLocalAccountId,
      accountFirstname,
      accountLastname,
      accountEmail,
      contactFullName,
      contactEmail,
      contactPhone,
    },
    userRoles,
  }: {
    input: UpdateCertificationAuthorityLocalAccountGeneralInformationInput;
    userRoles: KeyCloakUserRole[];
  }) => {
    const oldAccounts = await prismaClient.account.findMany({
      where: {
        certificationAuthorityLocalAccount: {
          some: {
            id: certificationAuthorityLocalAccountId,
          },
        },
      },
    });

    if (oldAccounts.length > 1) {
      throw new Error(
        "Plusieurs comptes utilisateurs du compte local certification trouvés",
      );
    }

    const oldAccount = oldAccounts[0];

    if (!oldAccount) {
      throw new Error(
        "Compte utilisateur du compte local certification non trouvé",
      );
    }

    //only update the account info if the user is an admin or a certification authority local account manager
    //certification authority local account owner can only update the contact info
    if (
      userRoles.includes("admin") ||
      userRoles.includes("manage_certification_authority_local_account")
    ) {
      await updateAccountById({
        accountId: oldAccount.id,
        accountData: {
          email: accountEmail,
          firstname: accountFirstname || "",
          lastname: accountLastname || "",
        },
      });
    }

    return prismaClient.certificationAuthorityLocalAccount.update({
      where: {
        id: certificationAuthorityLocalAccountId,
      },
      data: {
        contactFullName,
        contactEmail,
        contactPhone,
      },
    });
  };
