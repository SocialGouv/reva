import { Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "./client";

export const getFundingRequest = async (params: { candidacyId: string }) => {
  try {
    const fundingRequest = await prismaClient.fundingRequest.findFirst({
      where: {
        candidacyId: params.candidacyId,
      },
      include: {
        basicSkills: true,
        trainings: true,
        companion: true,
      },
    });

    return Right(fundingRequest);
  } catch (e) {
    return Left(`error while retrieving funding request`);
  }
};

export const createFundingRequest = async (params: {
  candidacyId: string;
  fundingRequest: {
    companionId: string;
    diagnosisHourCount: number;
    diagnosisCost: number;
    postExamHourCount: number;
    postExamCost: number;
    individualHourCount: number;
    individualCost: number;
    collectiveHourCount: number;
    collectiveCost: number;
    additionalHourCount: number;
    additionalCost: number;
    basicSkillsIds: string[];
    basicSkillsHourCount: number;
    basicSkillsCost: number;
    mandatoryTrainingsIds: string[];
    certificateSkills: string;
    certificateSkillsHourCount: number;
    certificateSkillsCost: number;
    otherTraining: string;
    otherTrainingHourCount: number;
    otherTrainingCost: number;
    examHourCount: number;
    examCost: number;
  };
}) => {
  try {
    const newFundingRequest = await prismaClient.fundingRequest.create({
      data: {
        candidacyId: params.candidacyId,
        companionId: params.fundingRequest.companionId,
        diagnosisHourCount: params.fundingRequest.diagnosisHourCount,
        diagnosisCost: params.fundingRequest.diagnosisCost,
        postExamHourCount: params.fundingRequest.postExamHourCount,
        postExamCost: params.fundingRequest.postExamCost,
        individualHourCount: params.fundingRequest.individualHourCount,
        individualCost: params.fundingRequest.individualCost,
        collectiveHourCount: params.fundingRequest.collectiveHourCount,
        collectiveCost: params.fundingRequest.collectiveCost,
        additionalHourCount: params.fundingRequest.additionalHourCount,
        additionalCost: params.fundingRequest.additionalCost,
        // basicSkillsIds: params.fundingRequest.basicSkillsIds,
        basicSkillsHourCount: params.fundingRequest.basicSkillsHourCount,
        basicSkillsCost: params.fundingRequest.basicSkillsCost,
        // mandatoryTrainingsIds: params.fundingRequest.mandatoryTrainingsIds,
        certificateSkills: params.fundingRequest.certificateSkills,
        certificateSkillsHourCount:
          params.fundingRequest.certificateSkillsHourCount,
        certificateSkillsCost: params.fundingRequest.certificateSkillsCost,
        otherTraining: params.fundingRequest.otherTraining,
        otherTrainingHourCount: params.fundingRequest.otherTrainingHourCount,
        otherTrainingCost: params.fundingRequest.otherTrainingCost,
        examHourCount: params.fundingRequest.examHourCount,
        examCost: params.fundingRequest.examCost,
      },
    });

    await prismaClient.$transaction([
      prismaClient.basicSkillOnFundingRequests.createMany({
        data: params.fundingRequest.basicSkillsIds.map((id) => ({
          basicSkillId: id,
          fundingRequestId: newFundingRequest.id,
        })),
      }),
      prismaClient.trainingOnFundingRequests.createMany({
        data: params.fundingRequest.mandatoryTrainingsIds.map((id) => ({
          trainingId: id,
          fundingRequestId: newFundingRequest.id,
        })),
      }),
    ]);

    const fundingRequest = await prismaClient.fundingRequest.findFirst({
      where: {
        id: newFundingRequest.id,
      },
      include: {
        basicSkills: true,
        companion: true,
        trainings: true,
      },
    });

    return Right(fundingRequest);
  } catch (e) {
    return Left("error while creating funding request");
  }
};
