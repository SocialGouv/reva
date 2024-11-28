import { CertificationAuthority } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityCertifications = async ({
  certificationAuthorityId,
  certificationIds,
}: {
  certificationAuthorityId: string;
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
    //remove the local account certifications association for the certifications which are no longer associated with the certification authority
    prismaClient.certificationAuthorityLocalAccountOnCertification.deleteMany({
      where: {
        certificationAuthorityLocalAccount: { certificationAuthorityId },
        certificationId: { notIn: certificationIds },
      },
    }),
    prismaClient.certificationAuthority.findFirst({
      where: { id: certificationAuthorityId },
    }),
  ]);
  return result[3] as CertificationAuthority;
};
