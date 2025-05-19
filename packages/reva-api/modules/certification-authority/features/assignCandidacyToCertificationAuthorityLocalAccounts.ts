import { prismaClient } from "../../../prisma/client";

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

    let certificationAuthorityLocalAccounts: { id: string }[] | undefined =
      undefined;

    // If the candidacy is part of a VAE collective cohort, the certification authorities available are restricted to those defined for that cohort
    if (candidacy.cohorteVaeCollectiveId) {
      const certificationVaeCollective =
        await prismaClient.certificationCohorteVaeCollective.findFirst({
          where: {
            cohorteVaeCollectiveId: candidacy.cohorteVaeCollectiveId,
            certificationId: candidacy.certificationId,
          },
        });

      // It means certification is part of cohort
      if (certificationVaeCollective) {
        const certificationCohorteVaeCollectiveOnCertificationAuthorities =
          await prismaClient.certificationCohorteVaeCollectiveOnCertificationAuthority.findMany(
            {
              where: {
                certificationCohorteVaeCollectiveId:
                  certificationVaeCollective.id,
              },
              include: {
                certificationAuthority: true,
              },
            },
          );

        // It means there are restrictions of certification authorities on certificationId
        if (
          certificationCohorteVaeCollectiveOnCertificationAuthorities.length > 0
        ) {
          const certificationAuthority =
            certificationCohorteVaeCollectiveOnCertificationAuthorities.find(
              ({ certificationAuthority }) =>
                certificationAuthority.id ==
                feasibility.certificationAuthorityId,
            )?.certificationAuthority;

          // It means the certificationAuthority of candidacy is part of restricted ertification authorities
          // Do not throw exception here because certificationAuthority can transfer candidacy to another certificationAuthority
          if (certificationAuthority) {
            const certificationCohorteVaeCollectiveOnCertificationAuthorityOnCertificationAuthorityLocalAccounts =
              await prismaClient.certificationCohorteVaeCollectiveOnCertificationAuthorityOnCertificationAuthorityLocalAccount.findMany(
                {
                  where: {
                    certificationCohorteVaeCollectiveOnCertificationAuthority: {
                      certificationCohorteVaeCollectiveId:
                        certificationVaeCollective.id,
                      certificationAuthorityId:
                        feasibility.certificationAuthorityId,
                    },
                  },
                },
              );

            if (
              certificationCohorteVaeCollectiveOnCertificationAuthorityOnCertificationAuthorityLocalAccounts.length >
              0
            ) {
              certificationAuthorityLocalAccounts =
                certificationCohorteVaeCollectiveOnCertificationAuthorityOnCertificationAuthorityLocalAccounts.map(
                  ({ certificationAuthorityLocalAccountId }) => ({
                    id: certificationAuthorityLocalAccountId,
                  }),
                );
            }
          }
        }
      }
    }

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
