import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationInput } from "../referential.types";

export const updateCertification = async ({
  updateCertificationInput,
}: {
  updateCertificationInput: UpdateCertificationInput;
}) =>
  (
    await prismaClient.$transaction([
      prismaClient.certificationOnDomaine.deleteMany({
        where: { certificationId: updateCertificationInput.certificationId },
      }),
      prismaClient.certificationOnConventionCollective.deleteMany({
        where: { certificationId: updateCertificationInput.certificationId },
      }),
      prismaClient.certification.update({
        where: { id: updateCertificationInput.certificationId },
        data: {
          label: updateCertificationInput.label,
          rncpId: updateCertificationInput.codeRncp,
          level: updateCertificationInput.level,
          certificationAuthorityTag:
            updateCertificationInput.certificationAuthorityTag,
          availableAt: updateCertificationInput.availableAt,
          expiresAt: updateCertificationInput.expiresAt,
          typeDiplome: {
            connect: { id: updateCertificationInput.typeDiplomeId },
          },
        },
      }),
      prismaClient.certificationOnDomaine.createMany({
        data: updateCertificationInput.domaineIds.map((did) => ({
          certificationId: updateCertificationInput.certificationId,
          domaineId: did,
        })),
      }),
      prismaClient.certificationOnConventionCollective.createMany({
        data: updateCertificationInput.conventionCollectiveIds.map((ccnId) => ({
          certificationId: updateCertificationInput.certificationId,
          ccnId,
        })),
      }),
    ])
  )[2];
