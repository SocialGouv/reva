import { Left, Right } from "purify-ts";

import { logger } from "../../logger";
import { prismaClient } from "./client";

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
