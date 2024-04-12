import { DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput } from "modules/dematerialized-feasibility-file/dematerialized-feasibility-file.types";
import { prismaClient } from "../../../prisma/client";
import { CompetenceBlocsPartCompletionEnum } from "@prisma/client";

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

  const dff = await prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
    include: {
      dffCertificationCompetenceBlocs: {
        include: {
          certificationCompetenceBloc: {
            include: { competences: { select: { id: true } } },
          },
        },
      },
      dffCertificationCompetenceDetails: {
        include: { certificationCompetence: { select: { id: true } } },
      },
    },
  });
  if (!dff) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  //number of competences in selected competences blocs
  const dffCompetenceCount = dff.dffCertificationCompetenceBlocs
    .map((dffcb) => dffcb.certificationCompetenceBloc)
    .flatMap((ccb) => ccb.competences)
    .map(() => 1)
    .reduce((acc) => acc + 1);

  //number of competences details in feasibility file
  const dffCertificationCompetenceDetailsCount =
    dff.dffCertificationCompetenceDetails.map(() => 1).reduce((acc) => acc + 1);

  let competenceBlocsPartCompletion: CompetenceBlocsPartCompletionEnum =
    "TO_COMPLETE";
  if (dffCompetenceCount - dffCertificationCompetenceDetailsCount === 0) {
    competenceBlocsPartCompletion = "COMPLETED";
  } else if (dffCompetenceCount > 0) {
    competenceBlocsPartCompletion = "IN_PROGRESS";
  }

  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: { competenceBlocsPartCompletion },
  });

  return dff;
};
