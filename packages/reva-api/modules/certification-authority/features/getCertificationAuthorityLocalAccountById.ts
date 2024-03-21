import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityLocalAccountById = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) =>
  prismaClient.certificationAuthorityLocalAccount.findUnique({
    where: { id: certificationAuthorityLocalAccountId },
  });
