import { faker } from "@faker-js/faker/.";
import { FundingRequestBatchUnifvae } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createFundingRequestHelper } from "./create-funding-request-helper";
export const createFundingRequestBatchHelper = async (
  args?: Partial<FundingRequestBatchUnifvae>,
) => {
  const fundingRequest = await createFundingRequestHelper();

  return prismaClient.fundingRequestBatchUnifvae.create({
    data: {
      fundingRequestId: fundingRequest.id,
      content: {
        field1: faker.number.int(),
        field2: faker.lorem.words(),
        field3: faker.lorem.words(),
        field4: faker.number.float(),
      },
      ...(args as any),
    },
  });
};
