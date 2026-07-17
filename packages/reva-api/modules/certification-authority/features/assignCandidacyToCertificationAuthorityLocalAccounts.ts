import {
  CANDIDATURE_NON_TROUVEE,
  CANDIDATURE_PAS_ASSOCIEE_CERTIFICATION,
  CANDIDATURE_PAS_DOSSIER_FAISABILITE_COURS,
  CANDIDAT_ASSOCIE_CANDIDATURE_PAS_RATTACHE_DEPARTEMENT,
  DOSSIER_FAISABILITE_PAS_RELIE_AUTORITE_CERTIFICATION,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const assignCandidacyToCertificationAuthorityLocalAccounts =
  async (params: { candidacyId: string }) => {
    const { candidacyId } = params;

    const candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        candidate: true,
        Feasibility: { where: { isActive: true } },
      },
    });

    if (!candidacy) {
      throw new Error(CANDIDATURE_NON_TROUVEE);
    }

    if (!candidacy.candidate?.departmentId) {
      throw new Error(CANDIDAT_ASSOCIE_CANDIDATURE_PAS_RATTACHE_DEPARTEMENT);
    }

    if (!candidacy.certificationId) {
      throw new Error(CANDIDATURE_PAS_ASSOCIEE_CERTIFICATION);
    }

    const feasibility = candidacy.Feasibility[0];

    if (!feasibility) {
      throw new Error(CANDIDATURE_PAS_DOSSIER_FAISABILITE_COURS);
    }

    if (!feasibility.certificationAuthorityId) {
      throw new Error(DOSSIER_FAISABILITE_PAS_RELIE_AUTORITE_CERTIFICATION);
    }

    let certificationAuthorityLocalAccounts: { id: string }[] | undefined =
      undefined;

    if (!certificationAuthorityLocalAccounts) {
      certificationAuthorityLocalAccounts =
        await prismaClient.certificationAuthorityLocalAccount.findMany({
          where: {
            certificationAuthorityId: feasibility.certificationAuthorityId,
            certificationAuthorityLocalAccountOnCertification: {
              some: { certificationId: candidacy.certificationId },
            },
            certificationAuthorityLocalAccountOnDepartment: {
              some: { departmentId: candidacy.candidate.departmentId },
            },
          },
        });
    }

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.createMany(
      {
        data: certificationAuthorityLocalAccounts.map(({ id }) => ({
          candidacyId,
          certificationAuthorityLocalAccountId: id,
        })),
        skipDuplicates: true,
      },
    );
  };
