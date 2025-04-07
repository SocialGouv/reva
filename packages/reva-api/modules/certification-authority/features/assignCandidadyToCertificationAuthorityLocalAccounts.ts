import { prismaClient } from "../../../prisma/client";

export const assignCandidadyToCertificationAuthorityLocalAccounts =
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
      throw new Error("Candidature non trouvée");
    }

    if (!candidacy.candidate?.departmentId) {
      throw new Error(
        "Le candidat associé à la candidature n'est pas rattaché à un département",
      );
    }

    if (!candidacy.certificationId) {
      throw new Error("La candidature n'est pas associée à une certification");
    }

    const feasibility = candidacy.Feasibility[0];

    if (!feasibility) {
      throw new Error(
        "La candidature n'a pas de dossier de faisabilité en cours",
      );
    }

    if (!feasibility.certificationAuthorityId) {
      throw new Error(
        "Le dossier de faisabilité n'est pas relié à une autorité de certification",
      );
    }

    const certificationAuthorityLocalAccounts =
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

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.deleteMany(
      { where: { candidacyId } },
    );

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
