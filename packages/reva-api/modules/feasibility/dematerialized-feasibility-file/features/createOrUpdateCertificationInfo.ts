import { DematerializedFeasibilityFile } from "@prisma/client";
import { prismaClient } from "../../../../prisma/client";
import { updateCandidacyCertificationCompletion } from "../../../candidacy/features/updateCandidacyCertificationCompletion";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationInfo = async ({
  input,
  candidacyId,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
  candidacyId: string;
}): Promise<DematerializedFeasibilityFile> => {
  const currentFile = await getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });

  const data = {
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

  let dff: DematerializedFeasibilityFile;
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

    if (currentFile.sentToCandidateAt) {
      await resetDFFSentToCandidateState(currentFile);
    }
  } else {
    const [_, feasibility] = await prismaClient.$transaction([
      prismaClient.feasibility.updateMany({
        where: { candidacyId },
        data: { isActive: false },
      }),
      prismaClient.feasibility.create({
        data: {
          candidacyId,
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            create: {
              ...data,
              certificationPartComplete: true,
            },
          },
        },
        include: {
          dematerializedFeasibilityFile: true,
        },
      }),
    ]);

    dff =
      feasibility.dematerializedFeasibilityFile as DematerializedFeasibilityFile;
  }

  await updateCandidacyCertificationCompletion({
    candidacyId,
    completion: input.completion,
  });

  if (currentFile?.sentToCandidateAt) {
    await resetDFFSentToCandidateState(currentFile);
  }

  return dff;
};
