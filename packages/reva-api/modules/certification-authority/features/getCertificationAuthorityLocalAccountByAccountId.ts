import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityLocalAccountByAccountId = ({
  accountId,
}: {
  accountId: string;
}) =>
  prismaClient.certificationAuthorityLocalAccount.findFirst({
    where: { accountId },
    include: {
      certificationAuthorityLocalAccountOnDepartment: true,
      certificationAuthorityLocalAccountOnCertification: true,
    },
  });
