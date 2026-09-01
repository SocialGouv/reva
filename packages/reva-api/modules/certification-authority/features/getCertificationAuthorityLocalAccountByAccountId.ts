import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityLocalAccountByAccountId = async ({
  accountId,
}: {
  accountId: string;
}) => {
  const account = await prismaClient.account.findUnique({
    where: { id: accountId },
    include: {
      certificationAuthorityLocalAccount: {
        include: {
          certificationAuthorityLocalAccountOnDepartment: true,
          certificationAuthorityLocalAccountOnCertification: true,
        },
      },
    },
  });

  return account?.certificationAuthorityLocalAccount ?? null;
};
