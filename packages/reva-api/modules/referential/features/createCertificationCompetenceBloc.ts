import { CertificationStatus } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { CreateCompetenceBlocInput } from "../referential.types";

import { getCertificationById } from "./getCertificationById";

export const createCertificationCompetenceBloc = async ({
  certificationId,
  label,
  competences,
}: CreateCompetenceBlocInput) => {
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
