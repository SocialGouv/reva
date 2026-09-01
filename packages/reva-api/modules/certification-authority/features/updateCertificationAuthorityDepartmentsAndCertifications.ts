import { CertificationAuthority } from "@prisma/client";

import { updateCertificationsVisibility } from "@/modules/referential/features/updateCertificationsVisibility";
import { prismaClient } from "@/prisma/client";

import { refreshCertificationAuthorityOfCandidacies } from "./refreshCertificationAuthorityOfCandidacies";

export const updateCertificationAuthorityDepartmentsAndCertifications = async ({
  certificationAuthorityId,
  certificationIds,
  departmentIds,
}: {
  certificationAuthorityId: string;
  departmentIds: string[];
  certificationIds: string[];
}): Promise<CertificationAuthority> => {
  const previousCertificationIds = (
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: { certificationAuthorityId },
      select: { certificationId: true },
    })
  ).map(({ certificationId }) => certificationId);

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

  // Certifications gaining or losing their last certification authority here
  // may become visible or invisible, so recompute for both the old and new sets.
  await updateCertificationsVisibility(
    [...new Set([...previousCertificationIds, ...certificationIds])],
    prismaClient,
  );

  await refreshCertificationAuthorityOfCandidacies({
    updatedCertificationAuthorityId: certificationAuthorityId,
    certificationIds,
    departmentIds,
  });

  return result[6] as CertificationAuthority;
};
