import { CertificationAuthority } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityCertifications = async ({
  certificationAuthorityId,
  certificationIds,
}: {
  certificationAuthorityId: string;
  certificationIds: string[];
}): Promise<CertificationAuthority> => {
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
    });
  if (!certificationAuthority) {
    throw new Error("Authorité de certification non trouvée");
  }

  await prismaClient.$transaction(async (tx) => {
    const currentCertifications =
      await tx.certificationAuthorityOnCertification.findMany({
        where: { certificationAuthorityId },
      });

    const currentCertificationIds = currentCertifications.map(
      ({ certificationId }) => certificationId,
    );

    const deletedCertificationIds = currentCertificationIds.filter(
      (id) => certificationIds.indexOf(id) == -1,
    );

    const addedCertificationIds = certificationIds.filter(
      (id) => currentCertificationIds.indexOf(id) == -1,
    );

    // Delete certifications on certification authority
    await tx.certificationAuthorityOnCertification.deleteMany({
      where: {
        certificationAuthorityId,
        certificationId: { in: deletedCertificationIds },
      },
    });

    // Delete certifications on certification authority local account based on certificationAuthorityId
    await tx.certificationAuthorityLocalAccountOnCertification.deleteMany({
      where: {
        certificationAuthorityLocalAccount: {
          certificationAuthorityId,
        },
        certificationId: { in: deletedCertificationIds },
      },
    });

    // Add certifications on certification authority
    await tx.certificationAuthorityOnCertification.createMany({
      data: addedCertificationIds.map((id) => ({
        certificationId: id,
        certificationAuthorityId,
      })),
    });

    // Find certification authority local accounts based on certification authority
    const certificationAuthorityLocalAccounts =
      await tx.certificationAuthorityLocalAccount.findMany({
        where: {
          certificationAuthorityId,
        },
      });

    const certificationAuthorityLocalAccountOnCertifications =
      addedCertificationIds.reduce(
        (acc, certificationId) => [
          ...acc,
          ...certificationAuthorityLocalAccounts.map(
            ({ id: certificationAuthorityLocalAccountId }) => ({
              certificationAuthorityLocalAccountId,
              certificationId,
            }),
          ),
        ],
        [] as {
          certificationId: string;
          certificationAuthorityLocalAccountId: string;
        }[],
      );

    // Add certification authority local accounts on certification
    await tx.certificationAuthorityLocalAccountOnCertification.createMany({
      data: certificationAuthorityLocalAccountOnCertifications,
    });
  });

  return certificationAuthority;
};
