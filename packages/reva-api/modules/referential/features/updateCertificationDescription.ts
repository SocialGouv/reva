import { CertificationStatus } from "@prisma/client";
import { UpdateCertificationDescriptionInput } from "../referential.types";
import { getCertificationById } from "./getCertificationById";
import { prismaClient } from "../../../prisma/client";

export const updateCertificationDescription = async ({
  certificationId,
  languages,
  juryModalities,
  juryFrequency,
  juryFrequencyOther,
  juryPlace,
  availableAt,
  expiresAt,
}: UpdateCertificationDescriptionInput) => {
  const certification = await getCertificationById({ certificationId });
  if (!certification) {
    throw new Error("La certification n'a pas été trouvée");
  }

  const allowedStatus: CertificationStatus[] = [
    "BROUILLON",
    "A_VALIDER_PAR_CERTIFICATEUR",
  ];

  if (!allowedStatus.includes(certification?.status)) {
    throw new Error(
      "Le statut de la certification ne permet pas de modifier la description",
    );
  }

  if (juryModalities.length == 0) {
    throw new Error("Renseigner au moins une modalité de jury");
  }

  if (juryFrequency && juryFrequencyOther) {
    throw new Error("Renseigner une seule fréquence de jury");
  }

  if (!juryFrequency && !juryFrequencyOther) {
    throw new Error("Renseigner au moins une fréquence de jury");
  }

  return await prismaClient.certification.update({
    where: { id: certificationId },
    data: {
      languages,
      juryModalities,
      juryFrequency,
      juryFrequencyOther,
      juryPlace,
      availableAt,
      expiresAt,
    },
  });
};