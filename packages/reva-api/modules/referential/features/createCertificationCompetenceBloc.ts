import { CertificationStatus } from "@prisma/client";

import {
  CERTIFICATION_PAS_ETE_TROUVEE,
  STATUT_CERTIFICATION_NE_PERMET_PAS_MODIFIER,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { CreateCompetenceBlocInput } from "../referential.types";

import { getCertificationById } from "./getCertificationById";

export const createCertificationCompetenceBloc = async ({
  certificationId,
  label,
  competences,
}: CreateCompetenceBlocInput) => {
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

  return prismaClient.certificationCompetenceBloc.create({
    data: {
      certificationId,
      label,
      competences: {
        createMany: { data: competences },
      },
    },
  });
};
