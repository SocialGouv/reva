import { prismaClient } from "../../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput } from "../dematerialized-feasibility-file.types";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationCompetenceDetails = async ({
  dematerializedFeasibilityFileId,
  competenceBlocId,
  competenceDetails,
}: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput) => {
  if (!dematerializedFeasibilityFileId) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  await prismaClient.$transaction([
    prismaClient.dFFCertificationCompetenceDetails.deleteMany({
      where: {
        dematerializedFeasibilityFileId,
        certificationCompetence: { blocId: competenceBlocId },
      },
    }),
    prismaClient.dFFCertificationCompetenceDetails.createMany({
      data: competenceDetails.map((c) => ({
        dematerializedFeasibilityFileId,
        certificationCompetenceId: c.competenceId,
        text: c.text,
        state: c.state,
      })),
    }),
    prismaClient.dFFCertificationCompetenceBloc.update({
      where: {
        dematerializedFeasibilityFileId_certificationCompetenceBlocId: {
          dematerializedFeasibilityFileId,
          certificationCompetenceBlocId: competenceBlocId,
        },
      },
      data: { complete: true },
    }),
  ]);

  await updateCompetenceBlocsPartCompletion({
    dematerializedFeasibilityFileId,
  });

  return prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
  });
};
