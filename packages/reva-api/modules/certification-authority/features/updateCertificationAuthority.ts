import { updateAccountById } from "@/modules/account/features/updateAccount";
import { prismaClient } from "@/prisma/client";

import { CertificationAuthority } from "../certification-authority.types";

export const updateCertificationAuthorityById = async ({
  certificationAuthorityId,
  certificationAuthorityData,
  userRoles,
}: {
  certificationAuthorityId: string;
  certificationAuthorityData: {
    label: string;
    accountFirstname: string;
    accountLastname: string;
    accountEmail: string;
    contactFullName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isGlobalContact: boolean;
  };
  userRoles: KeyCloakUserRole[];
}): Promise<CertificationAuthority> => {
  // Check if certificationAuthority with certificationAuthorityId exsits
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
      include: {
        Account: true,
      },
    });

  if (!certificationAuthority) {
    throw new Error(
      `Authorité de certification pour l'id ${certificationAuthorityId} non trouvé`,
    );
  }

  //only update the account info if the user is an admin
  if (userRoles.includes("admin")) {
    await updateAccountById({
      accountId: certificationAuthority.Account[0].id,
      accountData: {
        firstname: certificationAuthorityData.accountFirstname,
        lastname: certificationAuthorityData.accountLastname,
        email: certificationAuthorityData.accountEmail,
      },
    });
  }

  const updatedCertificationAuthority =
    await prismaClient.certificationAuthority.update({
      where: { id: certificationAuthority.id },
      data: {
        label: certificationAuthorityData.label,
        contactFullName: certificationAuthorityData.contactFullName,
        contactEmail: certificationAuthorityData.contactEmail,
        contactPhone: certificationAuthorityData.contactPhone,
      },
    });

  if (certificationAuthorityData.isGlobalContact) {
    await prismaClient.certificationAuthorityLocalAccount.updateMany({
      where: {
        certificationAuthorityId: certificationAuthority.id,
      },
      data: {
        contactFullName: certificationAuthorityData.contactFullName,
        contactEmail: certificationAuthorityData.contactEmail,
        contactPhone: certificationAuthorityData.contactPhone,
      },
    });
  }

  return updatedCertificationAuthority;
};
