import { CertificationStatus } from "@prisma/client";
import { UpdateCertificationPrerequisitesInput } from "../referential.types";
import { getCertificationById } from "./getCertificationById";
import { prismaClient } from "../../../prisma/client";

export const updateCertificationPrerequisites = async ({
  certificationId,
  prerequisites,
}: UpdateCertificationPrerequisitesInput) => {
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
