import { CertificationStatus } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { UpdateCertificationDescriptionInput } from "../referential.types";

import { getCertificationWithReducedRequirementsById } from "./getCertificationWithReducedRequirementsById";

export const updateCertificationDescription = async ({
  certificationId,
  juryTypeMiseEnSituationProfessionnelle,
  juryTypeSoutenanceOrale,
  juryFrequency,
  juryFrequencyOther,
  juryPlace,
  juryEstimatedCost,
  availableAt,
}: UpdateCertificationDescriptionInput) => {
  const certification = await getCertificationWithReducedRequirementsById({
    certificationId,
  });
  if (!certification) {
    throw new Error("La certification n'a pas été trouvée");
  }

  //Temporirarily to allow admins to update existing active certifications
  const allowedStatus: CertificationStatus[] = [
    "BROUILLON",
    "A_VALIDER_PAR_CERTIFICATEUR",
    "VALIDE_PAR_CERTIFICATEUR",
  ];

  if (!allowedStatus.includes(certification?.status)) {
    throw new Error(
      "Le statut de la certification ne permet pas de modifier la description",
    );
  }

  const hasReducedRequirements =
    certification.certificationAuthorityStructure?.hasReducedRequirements ??
    false;

  if (
    !hasReducedRequirements &&
    !juryTypeMiseEnSituationProfessionnelle &&
    !juryTypeSoutenanceOrale
  ) {
    throw new Error("Renseigner au moins une modalité de jury");
  }

  if (juryFrequency && juryFrequencyOther) {
    throw new Error("Renseigner une seule fréquence de jury");
  }

  if (!hasReducedRequirements && !juryFrequency && !juryFrequencyOther) {
    throw new Error("Renseigner au moins une fréquence de jury");
  }

  return await prismaClient.certification.update({
    where: { id: certificationId },
    data: {
      juryTypeMiseEnSituationProfessionnelle,
      juryTypeSoutenanceOrale,
      juryFrequency,
      juryFrequencyOther,
      juryPlace,
      juryEstimatedCost: juryEstimatedCost ?? null,
      availableAt,
    },
  });
};
