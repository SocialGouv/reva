import { FundingRequest, Organism } from "@prisma/client";
import { format } from "date-fns";
import pino from "pino";
import { Left, Right } from "purify-ts";

import { updateCandidacyStatus } from "./candidacies";
import { prismaClient } from "./client";

const logger = pino();

export const getFundingRequest = async (params: { candidacyId: string }) => {
  try {
    const fundingRequest = await prismaClient.fundingRequest.findFirst({
      where: {
        candidacyId: params.candidacyId,
      },
      include: {
        basicSkills: {
          select: {
            basicSkill: true,
          },
        },
        mandatoryTrainings: {
          select: {
            training: true,
          },
        },
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
    companionId?: string;
    diagnosisHourCount: number;
    diagnosisCost: number;
    postExamHourCount: number;
    postExamCost: number;
    individualHourCount: number;
    individualCost: number;
    collectiveHourCount: number;
    collectiveCost: number;
    basicSkillsIds: string[];
    basicSkillsHourCount: number;
    basicSkillsCost: number;
    mandatoryTrainingsIds: string[];
    mandatoryTrainingsHourCount: number;
    mandatoryTrainingsCost: number;
    certificateSkills: string;
    certificateSkillsHourCount: number;
    certificateSkillsCost: number;
    otherTraining: string;
    examHourCount: number;
    examCost: number;
  };
}) => {
  try {
    const newFundingRequest = await prismaClient.fundingRequest.create({
      data: {
        numAction: await getNextNumAction(),
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
        mandatoryTrainingsHourCount:
          params.fundingRequest.mandatoryTrainingsHourCount,
        mandatoryTrainingsCost: params.fundingRequest.mandatoryTrainingsCost,
        basicSkillsHourCount: params.fundingRequest.basicSkillsHourCount,
        basicSkillsCost: params.fundingRequest.basicSkillsCost,
        certificateSkills: params.fundingRequest.certificateSkills,
        certificateSkillsHourCount:
          params.fundingRequest.certificateSkillsHourCount,
        certificateSkillsCost: params.fundingRequest.certificateSkillsCost,
        otherTraining: params.fundingRequest.otherTraining,
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

    await updateCandidacyStatus({
      candidacyId: params.candidacyId,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
    });

    const fundingRequest = await prismaClient.fundingRequest.findFirst({
      where: {
        id: newFundingRequest.id,
      },
      include: {
        basicSkills: {
          select: {
            basicSkill: true,
          },
        },
        mandatoryTrainings: {
          select: {
            training: true,
          },
        },
        companion: true,
      },
    });

    return Right(
      fundingRequest as FundingRequest & {
        basicSkills: any;
        mandatoryTrainings: any;
        companion: Organism | null;
      }
    );
  } catch (e) {
    logger.error(e);
    return Left("error while creating funding request");
  }
};

const getNextNumAction = async () => {
  const nextValQueryResult =
    (await prismaClient.$queryRaw`Select nextval('funding_request_num_action_sequence')`) as {
      nextval: number;
    }[];
  return `reva_${format(new Date(), "yyyyMMdd")}_${nextValQueryResult[0].nextval
    .toString()
    .padStart(5, "0")}`;
};
