import { updateCandidacyCertificationCompletion } from "@/modules/candidacy/features/updateCandidacyCertificationCompletion";
import { prismaClient } from "@/prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "../dematerialized-feasibility-file.types";

import { generateAndUploadFeasibilityFileByCandidacyId } from "./generateAndUploadFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";
import { updateCompetenceBlocsPartCompletion } from "./updateCompetenceBlocsPartCompletion";

export const createOrUpdateCertificationInfo = async ({
  input,
  candidacyId,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
  candidacyId: string;
}) => {
  const currentFile = await getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });

  if (!currentFile) {
    await createCertificationInfo({ input, candidacyId });
  } else {
    await updateCertificationInfo({ input, candidacyId });
  }

  await updateCandidacyCertificationCompletion({
    candidacyId,
    completion: input.completion,
  });

  if (currentFile?.sentToCandidateAt) {
    await resetDFFSentToCandidateState(currentFile);
  }

  try {
    await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
  } catch (error) {
    console.error(error);
  }

  const updatedFile = await getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });

  return updatedFile;
};

const createCertificationInfo = async ({
  input,
  candidacyId,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
  candidacyId: string;
}) => {
  await validateIfCompetenceBlocsArePartOfCandidacyCertification(
    candidacyId,
    input.blocDeCompetencesIds,
  );

  await prismaClient.$transaction([
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
            certificationPartComplete: true,
          },
        },
      },
      include: {
        dematerializedFeasibilityFile: true,
      },
    }),
  ]);
};

const updateCertificationInfo = async ({
  input,
  candidacyId,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
  candidacyId: string;
}) => {
  const currentFile = await getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });

  if (!currentFile) {
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  await validateIfCompetenceBlocsArePartOfCandidacyCertification(
    candidacyId,
    input.blocDeCompetencesIds,
  );

  const currentBlocIds = currentFile.dffCertificationCompetenceBlocs.map(
    ({ certificationCompetenceBlocId }) => certificationCompetenceBlocId,
  );
  const nextBlocIds = [...input.blocDeCompetencesIds];
  const addedBlocIds = nextBlocIds.filter(
    (id) => currentBlocIds.indexOf(id) == -1,
  );

  // delete unused dFFCertificationCompetenceBloc
  await prismaClient.dFFCertificationCompetenceBloc.deleteMany({
    where: {
      dematerializedFeasibilityFileId: currentFile.id,
      certificationCompetenceBlocId: {
        notIn: nextBlocIds,
      },
    },
  });

  // delete all dFFCertificationCompetenceDetails based on dFFCertificationCompetenceBloc
  await prismaClient.dFFCertificationCompetenceDetails.deleteMany({
    where: {
      dematerializedFeasibilityFileId: currentFile.id,
      certificationCompetence: {
        blocId: { notIn: nextBlocIds },
      },
    },
  });

  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: currentFile.id },
    data: {
      firstForeignLanguage: input.firstForeignLanguage,
      secondForeignLanguage: input.secondForeignLanguage,
      option: input.option,
      dffCertificationCompetenceBlocs: {
        createMany: {
          data: addedBlocIds.map((bcid) => ({
            certificationCompetenceBlocId: bcid,
          })),
        },
      },
      certificationPartComplete: true,
    },
  });

  // recompute the competence blocs details section completion indicator
  await updateCompetenceBlocsPartCompletion({
    dematerializedFeasibilityFileId: currentFile.id,
  });
};

const validateIfCompetenceBlocsArePartOfCandidacyCertification = async (
  candidacyId: string,
  blocIds: string[],
) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: { certification: { include: { competenceBlocs: true } } },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const competenceBlocIds =
    candidacy.certification?.competenceBlocs.map(({ id }) => id) || [];

  for (const blocId of blocIds) {
    if (competenceBlocIds.indexOf(blocId) == -1) {
      throw new Error(
        "Le bloc sélectionné n'appartient pas à la certification",
      );
    }
  }
};
