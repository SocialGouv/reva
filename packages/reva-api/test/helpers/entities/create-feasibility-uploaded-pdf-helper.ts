import { CandidacyStatusStep, Feasibility } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";
import { createFileHelper } from "./create-file-helper";
import { assignCandidadyToCertificationAuthorityLocalAccounts } from "../../../modules/certification-authority/features/assignCandidadyToCertificationAuthorityLocalAccounts";

export const createFeasibilityUploadedPdfHelper = async (
  feasibilityArgs?: Partial<Feasibility>,
  candidacyActiveStatus?: CandidacyStatusStep,
) => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus:
      candidacyActiveStatus ?? "DOSSIER_FAISABILITE_ENVOYE",
  });
  const file = await createFileHelper();

  const feasibility = await prismaClient.feasibility.create({
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

  if (feasibility.isActive && feasibility.certificationAuthorityId) {
    await assignCandidadyToCertificationAuthorityLocalAccounts({
      candidacyId: feasibility.candidacyId,
    });
  }

  return feasibility;
};
