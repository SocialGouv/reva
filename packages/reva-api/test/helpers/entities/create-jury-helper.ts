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

  const certificationAuthority = await createCertificationAuthorityHelper();

  return prismaClient.jury.create({
    data: {
      isActive: args?.isActive ?? true,
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
      dateOfSession: new Date(),
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
