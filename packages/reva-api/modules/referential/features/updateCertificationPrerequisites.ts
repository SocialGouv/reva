import { CertificationStatus } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationPrerequisitesInput } from "../referential.types";

import { getCertificationById } from "./getCertificationById";

export const updateCertificationPrerequisites = async ({
  certificationId,
  prerequisites,
}: UpdateCertificationPrerequisitesInput) => {
  const certification = await getCertificationById({ certificationId });
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
      "Le statut de la certification ne permet pas de modifier les prérequis",
    );
  }

  return await prismaClient.certification.update({
    where: { id: certificationId },
    data: {
      prerequisites: { deleteMany: {}, createMany: { data: prerequisites } },
    },
  });
};
