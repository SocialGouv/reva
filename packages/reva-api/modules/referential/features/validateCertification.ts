import { CertificationStatus } from "@prisma/client";
import { startOfToday, isAfter, isBefore } from "date-fns";

import { ValidateCertificationInput } from "../referential.types";
import { prismaClient } from "../../../prisma/client";

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
    certification.juryModalities.length > 0 &&
    ((certification.juryFrequency && certification.juryFrequency?.length > 0) ||
      certification.juryFrequencyOther) &&
    typeof certification.juryEstimatedCost === "number" &&
    certification.availableAt &&
    certification.expiresAt;

  if (!isDescriptionComplete) {
    throw new Error("La description de la certifiction n'est pas complète");
  }

  const visible =
    isAfter(startOfToday(), certification.availableAt) &&
    isBefore(startOfToday(), certification.expiresAt);

  return await prismaClient.certification.update({
    where: { id: certificationId },
    data: {
      status: "VALIDE_PAR_CERTIFICATEUR",
      visible,
    },
  });
};
