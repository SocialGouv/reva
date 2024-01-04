import { CertificationAuthority } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityDepartmentsAndCertifications = async ({
  certificationAuthorityId,
  certificationIds,
  departmentIds,
}: {
  certificationAuthorityId: string;
  departmentIds: string[];
  certificationIds: string[];
}): Promise<CertificationAuthority> => {
  const result = await prismaClient.$transaction([
    //delete old certifications associations and create the new ones
    prismaClient.certificationAuthorityOnCertification.deleteMany({
      where: { certificationAuthorityId },
    }),
    prismaClient.certificationAuthorityOnCertification.createMany({
      data: certificationIds.map((cid) => ({
        certificationAuthorityId,
        certificationId: cid,
      })),
    }),
    //delete old departments associations and create the new ones
    prismaClient.certificationAuthorityOnDepartment.deleteMany({
      where: { certificationAuthorityId },
    }),
    prismaClient.certificationAuthorityOnDepartment.createMany({
      data: departmentIds.map((did) => ({
        certificationAuthorityId,
        departmentId: did,
      })),
    }),
    //remove the local account certifications association for the certifications which are no longer associated with the certification authority
    prismaClient.certificationAuthorityLocalAccountOnCertification.deleteMany({
      where: {
        certificationAuthorityLocalAccount: { certificationAuthorityId },
        certificationId: { notIn: certificationIds },
      },
    }),
    //remove the local account departments association for the departments which are no longer associated with the certification authority
    prismaClient.certificationAuthorityLocalAccountOnDepartment.deleteMany({
      where: {
        certificationAuthorityLocalAccount: { certificationAuthorityId },
        departmentId: { notIn: departmentIds },
      },
    }),
    prismaClient.certificationAuthority.findFirst({
      where: { id: certificationAuthorityId },
    }),
  ]);

  return result[6] as CertificationAuthority;
};
