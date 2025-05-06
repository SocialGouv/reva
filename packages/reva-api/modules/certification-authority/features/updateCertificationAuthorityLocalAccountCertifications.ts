import { prismaClient } from "../../../prisma/client";

export const updateCertificationAuthorityLocalAccountCertifications = async ({
  certificationAuthorityLocalAccountId,
  certificationIds,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationIds: string[];
}) => {
  const [, , certificationAuthorityLocalAccount] =
    await prismaClient.$transaction([
      //delete old certifications associations and create the new ones
      prismaClient.certificationAuthorityLocalAccountOnCertification.deleteMany(
        {
          where: { certificationAuthorityLocalAccountId },
        },
      ),
      prismaClient.certificationAuthorityLocalAccountOnCertification.createMany(
        {
          data: certificationIds.map((did) => ({
            certificationAuthorityLocalAccountId,
            certificationId: did,
          })),
        },
      ),

      prismaClient.certificationAuthorityLocalAccount.findUnique({
        where: { id: certificationAuthorityLocalAccountId },
      }),
    ]);

  return certificationAuthorityLocalAccount;
};
