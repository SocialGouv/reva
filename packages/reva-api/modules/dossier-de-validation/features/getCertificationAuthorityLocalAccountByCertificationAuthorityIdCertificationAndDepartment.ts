import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment =
  ({
    certificationAuthorityId,
    departmentId,
    certificationId,
  }: {
    certificationAuthorityId: string;
    departmentId: string;
    certificationId: string;
  }) =>
    prismaClient.certificationAuthorityLocalAccount.findMany({
      where: {
        certificationAuthorityId,
        certificationAuthorityLocalAccountOnCertification: {
          some: { certificationId },
        },
        certificationAuthorityLocalAccountOnDepartment: {
          some: { departmentId },
        },
      },
    });
