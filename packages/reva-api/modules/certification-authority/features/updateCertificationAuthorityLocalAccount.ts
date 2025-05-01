import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationAuthorityLocalAccountInput } from "../certification-authority.types";

export const updateCertificationAuthorityLocalAccount = async ({
  certificationAuthorityLocalAccountId,
  departmentIds,
  certificationIds,
  contactFullName,
  contactEmail,
  contactPhone,
}: UpdateCertificationAuthorityLocalAccountInput) => {
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
    prismaClient.certificationAuthorityLocalAccount.update({
      where: {
        id: certificationAuthorityLocalAccountId,
      },
      data: {
        contactFullName,
        contactEmail,
        contactPhone,
      },
    }),
  ]);
  return result[4];
};
