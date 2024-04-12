import { DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput } from "modules/dematerialized-feasibility-file/dematerialized-feasibility-file.types";
import { prismaClient } from "../../../prisma/client";

export const createOrUpdateCertificationCompetenceDetails = async ({
  dematerializedFeasibilityFileId,
  competenceIdAndTexts,
}: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput) => {
  if (!dematerializedFeasibilityFileId) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  await prismaClient.dFFCertificationCompetenceDetails.deleteMany({
    where: { dematerializedFeasibilityFileId },
  });

  await prismaClient.dFFCertificationCompetenceDetails.createMany({
    data: competenceIdAndTexts.map((c) => ({
      dematerializedFeasibilityFileId,
      certificationCompetenceId: c.competenceId,
      text: c.text,
    })),
  });

  return prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
  });
};
