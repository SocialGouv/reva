import { DossierDeValidation } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createCandidacyHelper } from "./create-candidacy-helper";
import { createCertificationAuthorityHelper } from "./create-certification-authority-helper";
import { createFileHelper } from "./create-file-helper";

export const createDossierDeValidationHelper = async (
  dossierDeValidationArgs?: Partial<DossierDeValidation>,
) => {
  const candidacy = await createCandidacyHelper();
  const file = await createFileHelper();

  return prismaClient.dossierDeValidation.create({
    data: {
      candidacyId: dossierDeValidationArgs?.candidacyId ?? candidacy.id,
      decision: dossierDeValidationArgs?.decision ?? "PENDING",
      certificationAuthorityId:
        dossierDeValidationArgs?.certificationAuthorityId ??
        (await createCertificationAuthorityHelper()).id,
      dossierDeValidationFileId: file.id,
      ...dossierDeValidationArgs,
    },
    include: {
      candidacy: {
        include: {
          organism: {
            include: { organismOnAccounts: { include: { account: true } } },
          },
          candidate: true,
          certification: true,
        },
      },
    },
  });
};
