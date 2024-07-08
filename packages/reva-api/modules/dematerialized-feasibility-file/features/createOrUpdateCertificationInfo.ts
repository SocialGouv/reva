import { prismaClient } from "../../../prisma/client";
import { updateCandidacyCertificationCompletion } from "../../candidacy/features/updateCandidacyCertificationCompletion";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "../dematerialized-feasibility-file.types";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationInfo = async ({
  input,
  candidacyId,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
  candidacyId: string;
}) => {
  const currentFile =
    await prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { candidacyId },
    });

  const data = {
    candidacyId,
    firstForeignLanguage: input.firstForeignLanguage,
    secondForeignLanguage: input.secondForeignLanguage,
    option: input.option,
    dffCertificationCompetenceBlocs: {
      createMany: {
        data: input.blocDeCompetencesIds.map((bcid) => ({
          certificationCompetenceBlocId: bcid,
        })),
      },
    },
  };

  let dff = null;
  if (currentFile) {
    //delete previous dff certification / competenceBloc associations before recreating them
    await prismaClient.dFFCertificationCompetenceBloc.deleteMany({
      where: { dematerializedFeasibilityFileId: currentFile.id },
    });

    dff = await prismaClient.dematerializedFeasibilityFile.update({
      where: { id: currentFile.id },
      data: {
        ...data,
        certificationPartComplete: true,
      },
    });

    //delete all dFFCertificationCompetenceDetails were competences are not parts of the newly selected competence blocs
    await prismaClient.dFFCertificationCompetenceDetails.deleteMany({
      where: {
        dematerializedFeasibilityFileId: currentFile.id,
        certificationCompetence: {
          blocId: { notIn: input.blocDeCompetencesIds.map((bcid) => bcid) },
        },
      },
    });

    //recompute the competence blocs details section completion indicator
    await updateCompetenceBlocsPartCompletion({
      dematerializedFeasibilityFileId: currentFile.id,
    });
  } else {
    dff = prismaClient.dematerializedFeasibilityFile.create({
      data: { ...data, certificationPartComplete: true },
    });
  }

  await updateCandidacyCertificationCompletion({
    candidacyId,
    completion: input.completion,
  });

  return dff;
};
