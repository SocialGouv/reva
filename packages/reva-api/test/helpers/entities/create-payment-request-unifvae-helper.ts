import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createCandidacyHelper } from "./create-candidacy-helper";

export const createPaymentRequestUnifvaeHelper = async (
  args?: Partial<Prisma.PaymentRequestUnifvaeUncheckedCreateInput>,
) => {
  let candidacyId = args?.candidacyId;
  if (!candidacyId) {
    const candidacy = await createCandidacyHelper();
    candidacyId = candidacy.id;
  }

  return prismaClient.paymentRequestUnifvae.create({
    data: {
      candidacyId,
      individualEffectiveHourCount: 0,
      individualEffectiveCost: 0,
      collectiveEffectiveHourCount: 0,
      collectiveEffectiveCost: 0,
      mandatoryTrainingsEffectiveHourCount: 0,
      mandatoryTrainingsEffectiveCost: 0,
      basicSkillsEffectiveHourCount: 0,
      basicSkillsEffectiveCost: 0,
      certificateSkillsEffectiveHourCount: 0,
      certificateSkillsEffectiveCost: 0,
      otherTrainingEffectiveHourCount: 0,
      otherTrainingEffectiveCost: 0,
      invoiceNumber: faker.string.uuid(),
      ...args,
    },
  });
};
