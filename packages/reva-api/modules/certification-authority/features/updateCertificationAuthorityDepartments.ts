import { CertificationAuthority } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { refreshCertificationAuthorityOfCandidacies } from "./refreshCertificationAuthorityOfCandidacies";

export const updateCertificationAuthorityDepartments = async ({
  certificationAuthorityId,
  departmentIds,
}: {
  certificationAuthorityId: string;
  departmentIds: string[];
}): Promise<CertificationAuthority> => {
  const result = await prismaClient.$transaction([
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

  const certificationIds = (
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: { certificationAuthorityId },
      select: { certificationId: true },
    })
  ).map(({ certificationId }) => certificationId);

  await refreshCertificationAuthorityOfCandidacies({
    certificationIds,
    departmentIds,
  });

  return result[3] as CertificationAuthority;
};
