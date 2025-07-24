import { updateAccountById } from "@/modules/account/features/updateAccount";
import { prismaClient } from "@/prisma/client";

import { UpdateCertificationAuthorityLocalAccountGeneralInformationInput } from "../certification-authority.types";

export const updateCertificationAuthorityLocalAccountGeneralInformation =
  async ({
    certificationAuthorityLocalAccountId,
    accountFirstname,
    accountLastname,
    accountEmail,
    contactFullName,
    contactEmail,
    contactPhone,
  }: UpdateCertificationAuthorityLocalAccountGeneralInformationInput) => {
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

    await updateAccountById({
      accountId: oldAccount.id,
      accountData: {
        email: accountEmail,
        firstname: accountFirstname || "",
        lastname: accountLastname || "",
      },
    });

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
