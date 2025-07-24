import { CertificationStatus } from "@prisma/client";
import { startOfToday, isAfter, isBefore, isEqual } from "date-fns";

import { prismaClient } from "@/prisma/client";

import { ValidateCertificationInput } from "../referential.types";

import { getCertificationById } from "./getCertificationById";

export const validateCertification = async ({
  certificationId,
}: ValidateCertificationInput) => {
  const certification = await getCertificationById({ certificationId });
  if (!certification) {
    throw new Error("La certification n'a pas été trouvée");
  }

  const allowedStatus: CertificationStatus[] = ["A_VALIDER_PAR_CERTIFICATEUR"];

  if (!allowedStatus.includes(certification?.status)) {
    throw new Error(
      "Le statut de la certification ne permet pas de la valider",
    );
  }

  const isDescriptionComplete =
    (certification.juryTypeMiseEnSituationProfessionnelle ||
      certification.juryTypeSoutenanceOrale) &&
    ((certification.juryFrequency && certification.juryFrequency?.length > 0) ||
      certification.juryFrequencyOther) &&
    certification.availableAt &&
    certification.expiresAt;

  if (!isDescriptionComplete) {
    throw new Error("La description de la certification n'est pas complète");
  }

  const isTodayBetweenAvalaibleAtAndExpiresAt =
    isAfter(startOfToday(), certification.availableAt) &&
    isBefore(startOfToday(), certification.expiresAt);

  const isTodayEqualsToAvailableAt = isEqual(
    startOfToday(),
    certification.availableAt,
  );
  const idTodayEqualsToExpiresAt = isEqual(
    startOfToday(),
    certification.expiresAt,
  );

  const visible =
    isTodayEqualsToAvailableAt ||
    isTodayBetweenAvalaibleAtAndExpiresAt ||
    idTodayEqualsToExpiresAt;

  return await prismaClient.certification.update({
    where: { id: certificationId },
    data: {
      status: "VALIDE_PAR_CERTIFICATEUR",
      visible,
      certificationStatusHistory: {
        create: { status: "VALIDE_PAR_CERTIFICATEUR" },
      },
    },
  });
};
