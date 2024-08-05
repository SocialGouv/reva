import { prismaClient } from "../../../../prisma/client";

export const updateTrainingInformations = async (params: {
  candidacyId: string;
  training: {
    basicSkillIds: string[];
    mandatoryTrainingIds: string[];
    certificateSkills: string;
    otherTraining: string;
    individualHourCount: number;
    collectiveHourCount: number;
    additionalHourCount: number;
    isCertificationPartial: boolean;
  };
}) =>
  prismaClient.$transaction([
    prismaClient.basicSkillOnCandidacies.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    }),
    prismaClient.basicSkillOnCandidacies.createMany({
      data: params.training.basicSkillIds.map((id) => ({
        candidacyId: params.candidacyId,
        basicSkillId: id,
      })),
    }),
    prismaClient.trainingOnCandidacies.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    }),
    prismaClient.trainingOnCandidacies.createMany({
      data: params.training.mandatoryTrainingIds.map((id) => ({
        candidacyId: params.candidacyId,
        trainingId: id,
      })),
    }),
    prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        certificateSkills: params.training.certificateSkills,
        otherTraining: params.training.otherTraining,
        individualHourCount: params.training.individualHourCount,
        collectiveHourCount: params.training.collectiveHourCount,
        additionalHourCount: params.training.additionalHourCount,
        isCertificationPartial: params.training.isCertificationPartial,
      },
    }),
  ]);
