import { CertificationStatus } from "@prisma/client";

import {
  CERTIFICATION_PAS_ETE_TROUVEE,
  STATUT_CERTIFICATION_NE_PERMET_PAS_MODIFIER,
} from "@/modules/shared/errors/messages";
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
    throw new Error(CERTIFICATION_PAS_ETE_TROUVEE);
  }
  const allowedStatus: CertificationStatus[] = [
    "BROUILLON",
    "A_VALIDER_PAR_CERTIFICATEUR",
  ];

  if (!allowedStatus.includes(certification?.status)) {
    throw new Error(STATUT_CERTIFICATION_NE_PERMET_PAS_MODIFIER);
  }

  return prismaClient.certificationCompetenceBloc.delete({
    where: { id: certificationCompetenceBlocId },
  });
};
