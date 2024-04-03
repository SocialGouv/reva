import { DFFCertificationCompetenceBloc } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "../dematerialized-feasibility-file.types";
import { getCompetenceBlocsAndCompetencesByIds } from "../../referential/features/getCompetenceBlocsAndCompetencesByIds";
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

  if (currentFile) {
    await prismaClient.dFFCertificationCompetenceBloc.deleteMany({
      where: { dematerializedFeasibilityFileId: currentFile.id },
    });
  }

  const certificationCompetenceBloc =
    await getCompetenceBlocsAndCompetencesByIds({
      competenceBlocIds: input.blocDeCompetencesIds,
    });

  const blocsDeCompetences: Omit<
    DFFCertificationCompetenceBloc,
    "dematerializedFeasibilityFileId"
  >[] = certificationCompetenceBloc.map((c) => ({
    id: c.id,
    code: c.code,
    createdAt: c.createdAt,
    isOptional: c.isOptional,
    label: c.label,
  }));

  const data = {
    candidacyId: input.candidacyId,
    firstForeignLanguage: input.firstForeignLanguage,
    secondForeignLanguage: input.secondForeignLanguage,
    option: input.option,
    dFFCertificationCompetenceBlocs: {
      createMany: { data: blocsDeCompetences },
    },
  };

  const dff = await (currentFile
    ? prismaClient.dematerializedFeasibilityFile.update({
        where: { id: currentFile.id },
        data,
      })
    : prismaClient.dematerializedFeasibilityFile.create({ data }));

  await updateCandidacyCertificationCompletion({
    candidacyId: input.candidacyId,
    completion: input.completion,
  });

  await prismaClient.dFFCertificationCompetence.createMany({
    data: certificationCompetenceBloc.flatMap((c) => c.competences),
  });

  return dff;
};
