import { CandidacyStatusStep, Feasibility } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";
import { createFileHelper } from "./create-file-helper";

export const createFeasibilityUploadedPdfHelper = async (
  feasibilityArgs?: Partial<Feasibility>,
  candidacyActiveStatus?: CandidacyStatusStep,
) => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus:
      candidacyActiveStatus ?? "DOSSIER_FAISABILITE_ENVOYE",
  });
  const file = await createFileHelper();

  return prismaClient.feasibility.create({
    data: {
      candidacyId: feasibilityArgs?.candidacyId ?? candidacy.id,
      feasibilityUploadedPdf: {
        create: {
          feasibilityFileId: file.id,
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
          certification: true,
        },
      },
    },
  });
};
