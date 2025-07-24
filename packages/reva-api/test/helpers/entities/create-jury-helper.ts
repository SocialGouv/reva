import { Jury } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

import { createCandidacyHelper } from "./create-candidacy-helper";
import { createCertificationAuthorityHelper } from "./create-certification-authority-helper";

export const createJuryHelper = async (args?: Partial<Jury>) => {
  //either take the candidacy whose id is passed in args or create a new one
  const candidacy = args?.candidacyId
    ? await prismaClient.candidacy.findUnique({
        where: { id: args.candidacyId },
      })
    : await createCandidacyHelper();

  if (!candidacy) {
    throw new Error("candidacy not found");
  }

  const certificationAuthorityId =
    args?.certificationAuthorityId ||
    (await createCertificationAuthorityHelper()).id;

  return prismaClient.jury.create({
    data: {
      candidacyId: candidacy.id,
      dateOfSession: new Date(),
      isActive: true,
      certificationAuthorityId,
      ...args,
    },
    include: {
      candidacy: {
        include: {
          candidate: true,
          certification: true,
        },
      },
    },
  });
};
