import { startOfToday, isAfter, isEqual, isBefore } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { addCertificationReplacementToCertificationAuthoritiesAndLocalAccounts } from "../../certification-authority/features/addCertificationReplacementToCertificationAuthoritiesAndLocalAccounts";
import { UpdateCertificationInput } from "../referential.types";

export const replaceCertification = async ({
  replaceCertificationInput,
}: {
  replaceCertificationInput: UpdateCertificationInput;
}) => {
  //certification is active if the current date is greater or equal to the availability date and lower than the expiration date
  const today = startOfToday();
  const certificationAvailableNow =
    (isAfter(today, replaceCertificationInput.availableAt) ||
      isEqual(today, replaceCertificationInput.availableAt)) &&
    isBefore(today, replaceCertificationInput.expiresAt);

  const newCertification = await prismaClient.certification.create({
    data: {
      label: replaceCertificationInput.label,
      rncpId: replaceCertificationInput.codeRncp,
      level: replaceCertificationInput.level,
      certificationAuthorityTag:
        replaceCertificationInput.certificationAuthorityTag,
      availableAt: replaceCertificationInput.availableAt,
      expiresAt: replaceCertificationInput.expiresAt,
      status: certificationAvailableNow ? "AVAILABLE" : "INACTIVE",
      typeDiplome: {
        connect: { id: replaceCertificationInput.typeDiplomeId },
      },
      previousVersion: {
        connect: { id: replaceCertificationInput.certificationId },
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
