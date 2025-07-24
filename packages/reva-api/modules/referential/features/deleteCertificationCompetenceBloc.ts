import { CertificationStatus } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { getCertificationById } from "./getCertificationById";

export const deleteCertificationCompetenceBloc = async ({
  certificationId,
  certificationCompetenceBlocId,
}: {
  certificationId: string;
  certificationCompetenceBlocId: string;
}) => {
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
      "Le statut de la certification ne permet pas de modifier les blocs de compétences",
    );
  }

  return prismaClient.certificationCompetenceBloc.delete({
    where: { id: certificationCompetenceBlocId },
  });
};
