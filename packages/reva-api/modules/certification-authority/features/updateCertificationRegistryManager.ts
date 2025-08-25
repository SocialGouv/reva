import { updateAccountById } from "@/modules/account/features/updateAccount";
import { prismaClient } from "@/prisma/client";

export const updateCertificationRegistryManager = async ({
  certificationRegistryManagerId,
  accountFirstname,
  accountLastname,
  accountEmail,
}: {
  certificationRegistryManagerId: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
}) => {
  const certificationRegistryManager =
    await prismaClient.certificationRegistryManager.findUnique({
      where: {
        id: certificationRegistryManagerId,
      },
    });

  if (!certificationRegistryManager) {
    throw new Error("Le responsable de certifications n'a pas été trouvé");
  }

  await updateAccountById({
    accountId: certificationRegistryManager.accountId,
    accountData: {
      firstname: accountFirstname,
      lastname: accountLastname,
      email: accountEmail,
    },
  });

  return certificationRegistryManager;
};
