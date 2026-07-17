import { COMPTE_LOCAL_AUTORITE_CERTIFICATION_NON_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const assignCandidaciesToCertificationAuthorityLocalAccount =
  async (params: { certificationAuthorityLocalAccountId: string }) => {
    const { certificationAuthorityLocalAccountId } = params;

    const certificationAuthorityLocalAccount =
      await prismaClient.certificationAuthorityLocalAccount.findUnique({
        where: {
          id: certificationAuthorityLocalAccountId,
        },
        include: {
          certificationAuthorityLocalAccountOnCertification: true,
          certificationAuthorityLocalAccountOnDepartment: true,
        },
      });

    if (!certificationAuthorityLocalAccount) {
      throw new Error(COMPTE_LOCAL_AUTORITE_CERTIFICATION_NON_TROUVE);
    }

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

    try {
      await prismaClient.certificationAuthorityLocalAccountOnCandidacy.createMany(
        {
          data: feasibilities.map((feasibility) => ({
            certificationAuthorityLocalAccountId:
              certificationAuthorityLocalAccount.id,
            candidacyId: feasibility.candidacyId,
          })),
          skipDuplicates: true,
        },
      );
    } catch (error) {
      console.log(error);
    }
  };
