import { CandidacyDropOut } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";
import { createDropOutReasonHelper } from "./create-drop-out-reason-helper";

export const createCandidacyDropOutHelper = async (
  args?: Partial<CandidacyDropOut>,
) => {
  //either take the candidacy whose id is passed in args or create a new one
  const candidacy = args?.candidacyId
    ? await prismaClient.candidacy.findUnique({
        where: { id: args.candidacyId },
      })
    : await createCandidacyHelper();

  if (!candidacy) {
    throw new Error("candidacy not found");
  }
  const dropOutReason = await createDropOutReasonHelper();

  return prismaClient.candidacyDropOut.create({
    data: {
      status: candidacy?.status,
      candidacyId: candidacy.id,
      dropOutReasonId: dropOutReason.id,
      ...args,
    },
    include: {
      candidacy: { include: { candidate: true } },
      dropOutReason: true,
    },
  });
};
