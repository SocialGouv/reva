import { prismaClient } from "../prisma/client";

const fillCertificationAuthorityLocalAccountOnCandidacyTable = async () => {
  const certificationAuthorityLocalAccounts =
    await prismaClient.certificationAuthorityLocalAccount.findMany({
      include: {
        certificationAuthorityLocalAccountOnCertification: true,
        certificationAuthorityLocalAccountOnDepartment: true,
      },
    });

  for (const certificationAuthorityLocalAccount of certificationAuthorityLocalAccounts) {
    const departmentIds =
      certificationAuthorityLocalAccount.certificationAuthorityLocalAccountOnDepartment.map(
        ({ departmentId }) => departmentId,
      );
    const certificationIds =
      certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnCertification.map(
        ({ certificationId }) => certificationId,
      );

    const feasibilities = await prismaClient.feasibility.findMany({
      where: {
        isActive: true,
        certificationAuthorityId:
          certificationAuthorityLocalAccount.certificationAuthorityId,
        candidacy: {
          candidate: {
            departmentId: { in: departmentIds },
          },
          certificationId: { in: certificationIds },
        },
      },
    });

    for (const feasibility of feasibilities) {
      try {
        await prismaClient.certificationAuthorityLocalAccountOnCandidacy.create(
          {
            data: {
              certificationAuthorityLocalAccountId:
                certificationAuthorityLocalAccount.id,
              candidacyId: feasibility.candidacyId,
            },
          },
        );
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const main = async () => {
  await fillCertificationAuthorityLocalAccountOnCandidacyTable();
};

main();
