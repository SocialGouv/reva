import { format } from "date-fns";
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

export const getNextNumAction = async () => {
  try {
    const nextValQueryResult =
      (await prismaClient.$queryRaw`Select nextval('funding_request_batch_num_action_sequence')`) as {
        nextval: number;
      }[];
    return Right(
      `reva_${format(new Date(), "yyyyMMdd")}_${nextValQueryResult[0].nextval
        .toString()
        .padStart(8, "0")}`
    );
  } catch (e) {
    logger.error(e);
    return Left("error while generating funding request batch numAction");
  }
};
