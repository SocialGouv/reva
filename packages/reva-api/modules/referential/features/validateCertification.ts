import { CertificationStatus } from "@prisma/client";

import { CERTIFICATION_PAS_ETE_TROUVEE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { ValidateCertificationInput } from "../referential.types";

import { getCertificationWithReducedRequirementsById } from "./getCertificationWithReducedRequirementsById";
import { updateCertificationsVisibility } from "./updateCertificationsVisibility";

export const validateCertification = async ({
  certificationId,
}: ValidateCertificationInput) => {
  const certification = await getCertificationWithReducedRequirementsById({
    certificationId,
  });
  if (!certification) {
    throw new Error(CERTIFICATION_PAS_ETE_TROUVEE);
  }

  const allowedStatus: CertificationStatus[] = ["A_VALIDER_PAR_CERTIFICATEUR"];

  if (!allowedStatus.includes(certification?.status)) {
    throw new Error(
      "Le statut de la certification ne permet pas de la valider",
    );
  }

  const hasReducedRequirements =
    certification.certificationAuthorityStructure?.hasReducedRequirements ??
    false;
  const hasJuryType =
    certification.juryTypeMiseEnSituationProfessionnelle ||
    certification.juryTypeSoutenanceOrale;
  const hasJuryFrequency =
    (certification.juryFrequency && certification.juryFrequency?.length > 0) ||
    certification.juryFrequencyOther;
  const hasRequiredJuryInfo =
    hasReducedRequirements || (hasJuryType && hasJuryFrequency);

  const isDescriptionComplete =
    hasRequiredJuryInfo &&
    !!certification.availableAt &&
    !!certification.rncpExpiresAt;

  if (!isDescriptionComplete) {
    throw new Error("La description de la certification n'est pas complète");
  }

  return prismaClient.$transaction(async (tx) => {
    await tx.certification.update({
      where: { id: certificationId },
      data: {
        status: "VALIDE_PAR_CERTIFICATEUR",
        certificationStatusHistory: {
          create: { status: "VALIDE_PAR_CERTIFICATEUR" },
        },
      },
    });

    // Visibility also depends on status/dates, which just changed, and on
    // having a certification authority assigned, so it must be recomputed here.
    await updateCertificationsVisibility([certificationId], tx);

    return tx.certification.findUniqueOrThrow({
      where: { id: certificationId },
    });
  });
};
