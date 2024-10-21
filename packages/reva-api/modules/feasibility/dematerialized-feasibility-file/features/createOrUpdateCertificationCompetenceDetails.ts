import { prismaClient } from "../../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput } from "../dematerialized-feasibility-file.types";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationCompetenceDetails = async ({
  dematerializedFeasibilityFileId,
  competenceBloc,
  competenceDetails,
}: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput) => {
  if (!dematerializedFeasibilityFileId) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  await prismaClient.$transaction([
    prismaClient.dFFCertificationCompetenceDetails.deleteMany({
      where: {
        dematerializedFeasibilityFileId,
        certificationCompetence: { blocId: competenceBloc.id },
      },
    }),
    prismaClient.dFFCertificationCompetenceDetails.createMany({
      data: competenceDetails.map((c) => ({
        dematerializedFeasibilityFileId,
        certificationCompetenceId: c.competenceId,
        state: c.state,
      })),
    }),
    prismaClient.dFFCertificationCompetenceBloc.update({
      where: {
        dematerializedFeasibilityFileId_certificationCompetenceBlocId: {
          dematerializedFeasibilityFileId,
          certificationCompetenceBlocId: competenceBloc.id,
        },
      },
      data: { complete: true, text: competenceBloc.text },
    }),
  ]);

  await updateCompetenceBlocsPartCompletion({
    dematerializedFeasibilityFileId,
  });

  return prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
  });
};
