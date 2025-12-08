import { FeasibilityFormat, Prisma } from "@prisma/client";

import { assignCandidacyToCertificationAuthorityLocalAccounts } from "@/modules/certification-authority/features/assignCandidacyToCertificationAuthorityLocalAccounts";
import { prismaClient } from "@/prisma/client";

import { createCandidacyHelper } from "./create-candidacy-helper";

export const createFeasibilityDematerializedHelper = async (
  feasibilityArgs?: Partial<Prisma.FeasibilityUncheckedCreateInput>,
) => {
  const candidacy = await createCandidacyHelper();

  const feasibility = await prismaClient.feasibility.create({
    data: {
      candidacyId: feasibilityArgs?.candidacyId ?? candidacy.id,
      feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
      dematerializedFeasibilityFile: {
        create: {},
      },
      ...feasibilityArgs,
    },
    include: {
      dematerializedFeasibilityFile: true,
      candidacy: {
        include: {
          organism: {
            include: { organismOnAccounts: { include: { account: true } } },
          },
          candidate: true,
        },
      },
    },
  });

  if (feasibility.isActive && feasibility.certificationAuthorityId) {
    await assignCandidacyToCertificationAuthorityLocalAccounts({
      candidacyId: feasibility.candidacyId,
    });
  }

  return feasibility;
};
