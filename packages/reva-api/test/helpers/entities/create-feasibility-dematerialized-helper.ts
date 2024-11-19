import {
  Candidacy,
  CandidacyStatusStep,
  DematerializedFeasibilityFile,
  Feasibility,
  FeasibilityFormat,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";

export const createFeasibilityDematerializedHelper = async ({
  feasibilityArgs,
  feasibilityDFFArgs,
  candidacyArgs,
  candidacyActiveStatus,
}: {
  feasibilityArgs?: Partial<Feasibility>;
  feasibilityDFFArgs?: Partial<DematerializedFeasibilityFile>;
  candidacyArgs?: Partial<Candidacy>;
  candidacyActiveStatus?: CandidacyStatusStep;
}) => {
  const candidacy = await createCandidacyHelper(
    candidacyArgs,
    candidacyActiveStatus,
  );

  return prismaClient.feasibility.create({
    data: {
      candidacyId: candidacyArgs?.id ?? candidacy.id,
      feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
      dematerializedFeasibilityFile: {
        create: {
          ...feasibilityDFFArgs,
        },
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
};
