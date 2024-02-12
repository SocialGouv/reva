import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationInput } from "../referential.types";

export const replaceCertification = async ({
  replaceCertificationInput,
}: {
  replaceCertificationInput: UpdateCertificationInput;
}) =>
  prismaClient.certification.create({
    data: {
      label: replaceCertificationInput.label,
      rncpId: replaceCertificationInput.codeRncp,
      level: replaceCertificationInput.level,
      certificationAuthorityTag:
        replaceCertificationInput.certificationAuthorityTag,
      availableAt: replaceCertificationInput.availableAt,
      expiresAt: replaceCertificationInput.expiresAt,
      typeDiplome: {
        connect: { id: replaceCertificationInput.typeDiplomeId },
      },
      certificationOnDomaine: {
        createMany: {
          data: replaceCertificationInput.domaineIds.map((domaineId) => ({
            domaineId,
          })),
        },
      },
      certificationOnConventionCollective: {
        createMany: {
          data: replaceCertificationInput.conventionCollectiveIds.map(
            (ccnId) => ({
              ccnId,
            }),
          ),
        },
      },
    },
  });
