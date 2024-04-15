import { DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput } from "modules/dematerialized-feasibility-file/dematerialized-feasibility-file.types";
import { prismaClient } from "../../../prisma/client";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationCompetenceDetails = async ({
  dematerializedFeasibilityFileId,
  competenceBlocId,
  competenceIdAndTexts,
}: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput) => {
  if (!dematerializedFeasibilityFileId) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  await prismaClient.dFFCertificationCompetenceDetails.deleteMany({
    where: {
      dematerializedFeasibilityFileId,
      certificationCompetence: { blocId: competenceBlocId },
    },
  });

  await prismaClient.dFFCertificationCompetenceDetails.createMany({
    data: competenceIdAndTexts.map((c) => ({
      dematerializedFeasibilityFileId,
      certificationCompetenceId: c.competenceId,
      text: c.text,
    })),
  });

  await updateCompetenceBlocsPartCompletion({
    dematerializedFeasibilityFileId,
  });

  return prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
  });
};
