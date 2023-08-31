import { Left, Right } from "purify-ts";

import { prismaClient } from "../../../../prisma/client";
import { logger } from "../../../shared/logger";

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
    logger.error(e);
    return Left(`error while retrieving funding request`);
  }
};
