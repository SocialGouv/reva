import { faker } from "@faker-js/faker";
import { FundingRequestUnifvae } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { FUNDING_REQUEST_FULL_CERT_OK_HOURS } from "../../../test/fixtures";
import { createCandidacyHelper } from "./create-candidacy-helper";

export const createFundingRequestHelper = async (
  args?: Partial<FundingRequestUnifvae>,
) => {
  const candidacy = await createCandidacyHelper();

  return prismaClient.fundingRequestUnifvae.create({
    data: {
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS,
      certificateSkills: faker.word.noun(),
      otherTraining: faker.word.noun(),
      candidacyId: candidacy.id,
      ...args,
    },
  });
};
