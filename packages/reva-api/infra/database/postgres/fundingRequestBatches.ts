import pino from "pino";
import { Left, Right } from "purify-ts";

import { FundingRequestBatch } from "../../../domain/types/candidate";
import { prismaClient } from "./client";

const logger = pino();

export const createFundingRequestBatch = async (params: {
  fundingRequestId: string;
  content: object;
}) => {
  try {
    return Right(
      (await prismaClient.fundingRequestBatch.create({
        data: { ...params },
      })) as unknown as FundingRequestBatch
    );
  } catch (e) {
    logger.error(e);
    return Left("error while creating funding request batch");
  }
};
