import { prismaClient } from "@/prisma/client";

import { assignCandidaciesToCertificationAuthorityLocalAccount } from "./assignCandidaciesToCertificationAuthorityLocalAccount";

export const updateCertificationAuthorityLocalAccountCertifications = async ({
  certificationAuthorityLocalAccountId,
  certificationIds,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationIds: string[];
}) => {
  await prismaClient.$transaction(async (tx) => {
    // Remove linked candidacies based on current certification ids, ignore direct assign of candidacies
    await tx.certificationAuthorityLocalAccountOnCandidacy.deleteMany({
      where: {
        hasBeenTransfered: null,
        certificationAuthorityLocalAccountId,
      },
    });

    // delete current certifications associations
    await tx.certificationAuthorityLocalAccountOnCertification.deleteMany({
      where: { certificationAuthorityLocalAccountId },
    });

    // add new certifications associations
    await tx.certificationAuthorityLocalAccountOnCertification.createMany({
      data: certificationIds.map((certificationId) => ({
        certificationAuthorityLocalAccountId,
        certificationId,
      })),
    });
  });

  // assign candidacies to certification authority local account based on new certifications
  await assignCandidaciesToCertificationAuthorityLocalAccount({
    certificationAuthorityLocalAccountId,
  });

  // return updated certification authority local account
  return prismaClient.certificationAuthorityLocalAccount.findUnique({
    where: { id: certificationAuthorityLocalAccountId },
  });
};
