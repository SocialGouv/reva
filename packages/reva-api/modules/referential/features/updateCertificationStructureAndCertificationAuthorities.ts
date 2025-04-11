import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationStructureAndCertificationAuthoritiesInput } from "../referential.types";

export const updateCertificationStructureAndCertificationAuthorities = async ({
  certificationId,
  certificationAuthorityStructureId,
  certificationAuthorityIds,
}: UpdateCertificationStructureAndCertificationAuthoritiesInput) => {
  const certification = await prismaClient.certification.findUnique({
    where: { id: certificationId },
  });
  if (!certification) {
    throw new Error("Certification non trouvée");
  }

  const certificationAuthorityStructure =
    await prismaClient.certificationAuthorityStructure.findUnique({
      where: { id: certificationAuthorityStructureId },
    });
  if (!certificationAuthorityStructure) {
    throw new Error("Structure d'authorité certificatrice non trouvée");
  }

  // Add or change Certification Authority Structure on certification
  if (
    !certification.certificationAuthorityStructureId ||
    certification.certificationAuthorityStructureId !=
      certificationAuthorityStructureId
  ) {
    await prismaClient.$transaction(async (tx) => {
      // Delete certification authorities and certification authority local accounts on certification
      await tx.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityOnCertification: { deleteMany: {} },
          certificationAuthorityLocalAccountOnCertification: {
            deleteMany: {},
          },
        },
      });

      // Add certification authorities on certification
      await tx.certificationAuthorityOnCertification.createMany({
        data: certificationAuthorityIds.map((id) => ({
          certificationId,
          certificationAuthorityId: id,
        })),
      });

      // Find certification authority local accounts based on certification authorities
      const certificationAuthorityLocalAccount =
        await tx.certificationAuthorityLocalAccount.findMany({
          where: {
            certificationAuthorityId: { in: certificationAuthorityIds },
          },
        });

      // Add certification authority local accounts on certification
      await tx.certificationAuthorityLocalAccountOnCertification.createMany({
        data: certificationAuthorityLocalAccount.map(({ id }) => ({
          certificationId,
          certificationAuthorityLocalAccountId: id,
        })),
      });

      // Update certificationAuthorityStructureId of certification
      await tx.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityStructureId,
        },
      });
    });
  }
  // Update Certification Authority Structure on certification
  else {
    await prismaClient.$transaction(async (tx) => {
      // Find certification authorities based on certificationId
      const currentCertificationAuthoritiesOnCertification =
        await tx.certificationAuthorityOnCertification.findMany({
          where: { certificationId },
        });

      const currentCertificationAuthorityIds =
        currentCertificationAuthoritiesOnCertification.map(
          ({ certificationAuthorityId }) => certificationAuthorityId,
        );

      const deletedCertificationAuthorityIds =
        currentCertificationAuthorityIds.filter(
          (id) => certificationAuthorityIds.indexOf(id) == -1,
        );

      const addedCertificationAuthorityIds = certificationAuthorityIds.filter(
        (id) => currentCertificationAuthorityIds.indexOf(id) == -1,
      );

      // Find certification authority local accounts based on deleted certification authorities
      const deletedCertificationAuthorityLocalAccount =
        await tx.certificationAuthorityLocalAccount.findMany({
          where: {
            certificationAuthorityId: { in: deletedCertificationAuthorityIds },
          },
        });

      // Delete certification authorities and certification authority local accounts on certification
      await tx.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityOnCertification: {
            deleteMany: {
              certificationAuthorityId: {
                in: deletedCertificationAuthorityIds,
              },
            },
          },
          certificationAuthorityLocalAccountOnCertification: {
            deleteMany: {
              certificationAuthorityLocalAccountId: {
                in: deletedCertificationAuthorityLocalAccount.map(
                  ({ id }) => id,
                ),
              },
            },
          },
        },
      });

      // Add certification authorities on certification
      await tx.certificationAuthorityOnCertification.createMany({
        data: addedCertificationAuthorityIds.map((id) => ({
          certificationId,
          certificationAuthorityId: id,
        })),
      });

      // Find certification authority local accounts based on added certification authorities
      const addedCertificationAuthorityLocalAccount =
        await tx.certificationAuthorityLocalAccount.findMany({
          where: {
            certificationAuthorityId: { in: addedCertificationAuthorityIds },
          },
        });

      // Add certification authority local accounts on certification
      await tx.certificationAuthorityLocalAccountOnCertification.createMany({
        data: addedCertificationAuthorityLocalAccount.map(({ id }) => ({
          certificationId,
          certificationAuthorityLocalAccountId: id,
        })),
      });

      // Update certificationAuthorityStructureId of certification
      await tx.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityStructureId,
        },
      });
    });
  }

  return prismaClient.certification.findUnique({
    where: { id: certificationId },
  });
};
