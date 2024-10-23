import { prismaClient } from "../../../../prisma/client";
import { CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID } from "../../../referential/referential.types";

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
    candidacyFinancingMethodIds: string[];
    candidacyFinancingMethodOtherSourceText?: string;
  };
}) =>
  prismaClient.$transaction(async (tx) => {
    await tx.basicSkillOnCandidacies.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    });
    await tx.basicSkillOnCandidacies.createMany({
      data: params.training.basicSkillIds.map((id) => ({
        candidacyId: params.candidacyId,
        basicSkillId: id,
      })),
    });
    await tx.trainingOnCandidacies.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    });
    await tx.trainingOnCandidacies.createMany({
      data: params.training.mandatoryTrainingIds.map((id) => ({
        candidacyId: params.candidacyId,
        trainingId: id,
      })),
    });

    await tx.candidacyOnCandidacyFinancingMethod.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    });
    await tx.candidacyOnCandidacyFinancingMethod.createMany({
      data: params.training.candidacyFinancingMethodIds.map((id) => ({
        candidacyId: params.candidacyId,
        candidacyFinancingMethodId: id,
      })),
    });

    if (
      params.training.candidacyFinancingMethodIds.find(
        (id) => id === CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID,
      )
    ) {
      await tx.candidacyOnCandidacyFinancingMethod.update({
        where: {
          candidacyId_candidacyFinancingMethodId: {
            candidacyId: params.candidacyId,
            candidacyFinancingMethodId:
              CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID,
          },
        },
        data: {
          additionalInformation:
            params.training.candidacyFinancingMethodOtherSourceText,
        },
      });
    }

    await tx.candidacy.update({
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
    });
  });
