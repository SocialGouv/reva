import {
  Candidacy,
  CandidacyStatusStep,
  Feasibility,
  FeasibilityUploadedPdf,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";
import { createFileHelper } from "./create-file-helper";

export const createFeasibilityUploadedPdfHelper = async ({
  feasibilityArgs,
  feasibilityUploadedPdfArgs,
  candidacyArgs,
  candidacyActiveStatus,
}: {
  feasibilityArgs?: Partial<Feasibility>;
  feasibilityUploadedPdfArgs?: Partial<FeasibilityUploadedPdf>;
  candidacyArgs?: Partial<Candidacy>;
  candidacyActiveStatus?: CandidacyStatusStep;
}) => {
  const candidacy = await createCandidacyHelper(
    candidacyArgs,
    candidacyActiveStatus,
  );
  const file = await createFileHelper();

  return prismaClient.feasibility.create({
    data: {
      candidacyId: candidacyArgs?.id ?? candidacy.id,
      feasibilityUploadedPdf: {
        create: {
          feasibilityFileId: file.id,
          ...feasibilityUploadedPdfArgs,
        },
      },
      ...feasibilityArgs,
    },
    include: {
      feasibilityUploadedPdf: true,
      candidacy: {
        include: {
          organism: { include: { accounts: true } },
          candidate: true,
          department: true,
        },
      },
    },
  });
};
