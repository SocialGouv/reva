import { prismaClient } from "../../../prisma/client";

export const transferCandidacyToCertificationAuthorityLocalAccount =
  async (params: {
    candidacyId: string;
    certificationAuthorityLocalAccountId: string;
  }) => {
    const { candidacyId, certificationAuthorityLocalAccountId } = params;

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

    const certificationAuthorityLocalAccount =
      await prismaClient.certificationAuthorityLocalAccount.findUnique({
        where: {
          id: certificationAuthorityLocalAccountId,
        },
      });
    if (!certificationAuthorityLocalAccount) {
      throw new Error("Compte local de l'autorité de certification non trouvé");
    }

    if (
      certificationAuthorityLocalAccount.certificationAuthorityId !=
      feasibility.certificationAuthorityId
    ) {
      throw new Error(
        "Le compte local n'appartient pas à l'authorité de certification associée au dossier de faisabilité de la candidature",
      );
    }

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.deleteMany(
      { where: { candidacyId } },
    );

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.create({
      data: {
        candidacyId,
        certificationAuthorityLocalAccountId,
      },
    });
  };
