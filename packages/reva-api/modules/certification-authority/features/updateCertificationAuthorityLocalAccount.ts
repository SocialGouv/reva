import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityLocalAccount = async ({
  certificationAuthorityLocalAccountId,
  departmentIds,
  certificationIds,
}: {
  certificationAuthorityLocalAccountId: string;
  departmentIds: string[];
  certificationIds: string[];
}) => {
  const result = await prismaClient.$transaction([
    prismaClient.certificationAuthorityLocalAccountOnCertification.deleteMany({
      where: { certificationAuthorityLocalAccountId },
    }),
    prismaClient.certificationAuthorityLocalAccountOnCertification.createMany({
      data: certificationIds.map((cid) => ({
        certificationAuthorityLocalAccountId,
        certificationId: cid,
      })),
    }),
    prismaClient.certificationAuthorityLocalAccountOnDepartment.deleteMany({
      where: { certificationAuthorityLocalAccountId },
    }),
    prismaClient.certificationAuthorityLocalAccountOnDepartment.createMany({
      data: departmentIds.map((did) => ({
        certificationAuthorityLocalAccountId,
        departmentId: did,
      })),
    }),
    prismaClient.certificationAuthorityLocalAccount.findFirst({
      where: {
        id: certificationAuthorityLocalAccountId,
      },
    }),
  ]);
  return result[4];
};
