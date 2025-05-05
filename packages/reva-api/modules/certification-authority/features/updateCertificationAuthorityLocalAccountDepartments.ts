import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityLocalAccountDepartments = async ({
  certificationAuthorityLocalAccountId,
  departmentIds,
}: {
  certificationAuthorityLocalAccountId: string;
  departmentIds: string[];
}) => {
  const [, , certificationAuthorityLocalAccount] =
    await prismaClient.$transaction([
      //delete old departments associations and create the new ones
      prismaClient.certificationAuthorityLocalAccountOnDepartment.deleteMany({
        where: { certificationAuthorityLocalAccountId },
      }),
      prismaClient.certificationAuthorityLocalAccountOnDepartment.createMany({
        data: departmentIds.map((did) => ({
          certificationAuthorityLocalAccountId,
          departmentId: did,
        })),
      }),

      prismaClient.certificationAuthorityLocalAccount.findUnique({
        where: { id: certificationAuthorityLocalAccountId },
      }),
    ]);

  return certificationAuthorityLocalAccount;
};
