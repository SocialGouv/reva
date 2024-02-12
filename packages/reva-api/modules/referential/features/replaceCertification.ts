import { prismaClient } from "../../../prisma/client";
import { addCertificationReplacementToCertificationAuthoritiesAndLocalAccounts } from "../../certification-authority/features/addCertificationReplacementToCertificationAuthoritiesAndLocalAccounts";
import { UpdateCertificationInput } from "../referential.types";

export const replaceCertification = async ({
  replaceCertificationInput,
}: {
  replaceCertificationInput: UpdateCertificationInput;
}) => {
  const newCertification = await prismaClient.certification.create({
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

  await addCertificationReplacementToCertificationAuthoritiesAndLocalAccounts({
    oldCertificationId: replaceCertificationInput.certificationId,
    newCertificationId: newCertification.id,
  });
  return newCertification;
};
