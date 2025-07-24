import { prismaClient } from "@/prisma/client";

export const getFundingRequest = async (params: { candidacyId: string }) =>
  prismaClient.fundingRequest.findFirst({
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
