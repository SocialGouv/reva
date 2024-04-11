import { prismaClient } from "../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "../dematerialized-feasibility-file.types";
import { updateCandidacyCertificationCompletion } from "../../candidacy/features/updateCandidacyCertificationCompletion";

export const createOrUpdateCertificationInfo = async ({
  input,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
}) => {
  const currentFile =
    await prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { candidacyId: input.candidacyId },
    });

  const data = {
    candidacyId: input.candidacyId,
    firstForeignLanguage: input.firstForeignLanguage,
    secondForeignLanguage: input.secondForeignLanguage,
    option: input.option,
    dFFCertificationCompetenceBlocs: {
      createMany: {
        data: input.blocDeCompetencesIds.map((bcid) => ({
          certificationCompetenceBlocId: bcid,
        })),
      },
    },
  };

  let dff = null;
  if (currentFile) {
    await prismaClient.dFFCertificationCompetenceBloc.deleteMany({
      where: { dematerializedFeasibilityFileId: currentFile.id },
    });

    dff = prismaClient.dematerializedFeasibilityFile.update({
      where: { id: currentFile.id },
      data: {
        ...data,
        certificationPartComplete: true,
      },
    });
  } else {
    dff = prismaClient.dematerializedFeasibilityFile.create({
      data: { ...data, certificationPartComplete: true },
    });
  }

  await updateCandidacyCertificationCompletion({
    candidacyId: input.candidacyId,
    completion: input.completion,
  });

  return dff;
};
