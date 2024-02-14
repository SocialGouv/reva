import { isAfter, isBefore, isEqual, startOfToday } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationInput } from "../referential.types";

export const updateCertification = async ({
  updateCertificationInput,
}: {
  updateCertificationInput: UpdateCertificationInput;
}) => {
  //certification is active if the current date is greater or equal to the availability date and lower than the expiration date
  const today = startOfToday();
  const certificationAvailableNow =
    (isAfter(today, updateCertificationInput.availableAt) ||
      isEqual(today, updateCertificationInput.availableAt)) &&
    isBefore(today, updateCertificationInput.expiresAt);

  const result = await prismaClient.$transaction([
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
        status: certificationAvailableNow ? "AVAILABLE" : "INACTIVE",
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
  ]);
  return result[2];
};
