import { Feasibility, FeasibilityFormat } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";
import { assignCandidadyToCertificationAuthorityLocalAccounts } from "../../../modules/certification-authority/features/assignCandidadyToCertificationAuthorityLocalAccounts";

export const createFeasibilityDematerializedHelper = async (
  feasibilityArgs?: Partial<Feasibility>,
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
          organism: { include: { accounts: true } },
          candidate: true,
        },
      },
    },
  });

  if (feasibility.isActive && feasibility.certificationAuthorityId) {
    await assignCandidadyToCertificationAuthorityLocalAccounts({
      candidacyId: feasibility.candidacyId,
    });
  }

  return feasibility;
};
