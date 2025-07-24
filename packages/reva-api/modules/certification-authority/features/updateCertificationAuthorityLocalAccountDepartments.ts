import { prismaClient } from "../../../prisma/client";

import { assignCandidaciesToCertificationAuthorityLocalAccount } from "./assignCandidaciesToCertificationAuthorityLocalAccount";

export const updateCertificationAuthorityLocalAccountDepartments = async ({
  certificationAuthorityLocalAccountId,
  departmentIds,
}: {
  certificationAuthorityLocalAccountId: string;
  departmentIds: string[];
}) => {
  await prismaClient.$transaction(async (tx) => {
    // Remove linked candidacies based on current department ids, ignore direct assign of candidacies
    await tx.certificationAuthorityLocalAccountOnCandidacy.deleteMany({
      where: {
        hasBeenTransfered: null,
        certificationAuthorityLocalAccountId,
      },
    });

    // delete current departments associations
    await tx.certificationAuthorityLocalAccountOnDepartment.deleteMany({
      where: { certificationAuthorityLocalAccountId },
    });

    // add new departments associations
    await tx.certificationAuthorityLocalAccountOnDepartment.createMany({
      data: departmentIds.map((departmentId) => ({
        certificationAuthorityLocalAccountId,
        departmentId,
      })),
    });
  });

  // assign candidacies to certification authority local account based on new departments
  await assignCandidaciesToCertificationAuthorityLocalAccount({
    certificationAuthorityLocalAccountId,
  });

  // return updated certification authority local account
  return prismaClient.certificationAuthorityLocalAccount.findUnique({
    where: { id: certificationAuthorityLocalAccountId },
  });
};
