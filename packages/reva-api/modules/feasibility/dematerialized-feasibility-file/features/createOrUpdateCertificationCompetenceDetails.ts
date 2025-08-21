import { prismaClient } from "@/prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput } from "../dematerialized-feasibility-file.types";

import { generateAndUploadFeasibilityFileByCandidacyId } from "./generateAndUploadFeasibilityFileByCandidacyId";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationCompetenceDetails = async ({
  dematerializedFeasibilityFileId,
  competenceBloc,
  competenceDetails,
}: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput) => {
  if (!dematerializedFeasibilityFileId) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  const dematerializedFeasibilityFile =
    await prismaClient.dematerializedFeasibilityFile.findUnique({
      where: { id: dematerializedFeasibilityFileId },
      select: {
        feasibility: {
          select: {
            candidacyId: true,
          },
        },
      },
    });

  if (!dematerializedFeasibilityFile) {
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

  try {
    await generateAndUploadFeasibilityFileByCandidacyId(
      dematerializedFeasibilityFile.feasibility.candidacyId,
    );
  } catch (error) {
    console.error(error);
  }

  return prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
  });
};
