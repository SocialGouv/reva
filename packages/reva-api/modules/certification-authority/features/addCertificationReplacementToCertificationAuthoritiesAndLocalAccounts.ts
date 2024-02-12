import { prismaClient } from "../../../prisma/client";

//Takes an old certification id and a new one
//Add the new one to every certification authority account (admin and local) that had the old one
export const addCertificationReplacementToCertificationAuthoritiesAndLocalAccounts =
  async ({
    oldCertificationId,
    newCertificationId,
  }: {
    oldCertificationId: string;
    newCertificationId: string;
  }) => {
    const certificationAuthorityWithOldCertificationIds = (
      await prismaClient.certificationAuthorityOnCertification.findMany({
        where: { certificationId: oldCertificationId },
        select: { certificationAuthorityId: true },
        distinct: ["certificationAuthorityId"],
      })
    ).map((ca) => ca.certificationAuthorityId);

    await prismaClient.certificationAuthorityOnCertification.createMany({
      data: certificationAuthorityWithOldCertificationIds.map((caid) => ({
        certificationAuthorityId: caid,
        certificationId: newCertificationId,
      })),
    });

    const certificationAuthorityLocalAccountWithOldCertificationIds = (
      await prismaClient.certificationAuthorityLocalAccountOnCertification.findMany(
        {
          where: { certificationId: oldCertificationId },
          select: { certificationAuthorityLocalAccountId: true },
          distinct: ["certificationAuthorityLocalAccountId"],
        },
      )
    ).map((cala) => cala.certificationAuthorityLocalAccountId);

    await prismaClient.certificationAuthorityLocalAccountOnCertification.createMany(
      {
        data: certificationAuthorityLocalAccountWithOldCertificationIds.map(
          (calaid) => ({
            certificationAuthorityLocalAccountId: calaid,
            certificationId: newCertificationId,
          }),
        ),
      },
    );
  };
