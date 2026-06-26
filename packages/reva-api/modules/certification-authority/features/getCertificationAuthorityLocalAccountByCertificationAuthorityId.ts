import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityLocalAccountByCertificationAuthorityId =
  ({
    certificationAuthorityId,
    departmentId,
    certificationId,
  }: {
    certificationAuthorityId: string;
    departmentId?: string;
    certificationId?: string;
  }) => {
    const certificationLocalAccountWhereClause: Prisma.CertificationAuthorityLocalAccountWhereInput =
      {};
    if (certificationId) {
      certificationLocalAccountWhereClause.certificationAuthorityLocalAccountOnCertification =
        {
          some: { certificationId },
        };
    }
    if (departmentId) {
      certificationLocalAccountWhereClause.certificationAuthorityLocalAccountOnDepartment =
        {
          some: { departmentId },
        };
    }

    return prismaClient.certificationAuthority
      .findUnique({ where: { id: certificationAuthorityId } })
      .certificationAuthorityLocalAccount({
        where: certificationLocalAccountWhereClause,
      });
  };
