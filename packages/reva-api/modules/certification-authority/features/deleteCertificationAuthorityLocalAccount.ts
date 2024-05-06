import { prismaClient } from "../../../prisma/client";
import { deleteAccount } from "../../account/features/deleteAccount";

export const deleteCertificationAuthorityLocalAccount = async ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const certificationAuthorityLocalAccount =
    await prismaClient.certificationAuthorityLocalAccount.findUnique({
      where: { id: certificationAuthorityLocalAccountId },
    });

  if (!certificationAuthorityLocalAccount) {
    throw new Error("Le compte certificateur local n'a pas été trouvé");
  }

  const result = await prismaClient.certificationAuthorityLocalAccount.delete({
    where: { id: certificationAuthorityLocalAccountId },
  });

  await deleteAccount({
    accountId: certificationAuthorityLocalAccount.accountId,
  });

  return result;
};
