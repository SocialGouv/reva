import { CandidacyDropOut, CandidacyStatusStep } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "./create-candidacy-helper";
import { createDropOutReasonHelper } from "./create-drop-out-reason-helper";

export const createCandidacyDropOutHelper = async (
  args?: Partial<CandidacyDropOut>,
) => {
  const candidacy = await createCandidacyHelper();
  const dropOutReason = await createDropOutReasonHelper();

  return prismaClient.candidacyDropOut.create({
    data: {
      status: CandidacyStatusStep.PARCOURS_ENVOYE,
      candidacyId: candidacy.id,
      dropOutReasonId: dropOutReason.id,
      ...args,
    },
    include: {
      candidacy: true,
      dropOutReason: true,
    },
  });
};
