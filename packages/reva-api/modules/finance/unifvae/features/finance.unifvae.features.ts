import { Candidate } from "@prisma/client";
import { format } from "date-fns";

import { prismaClient } from "../../../../prisma/client";
import { updateCandidacyStatus } from "../../../candidacy/database/candidacies";
import { createBatchFromFundingRequestUnifvae } from "./fundingRequestBatch";

export const createFundingRequestUnifvae = async ({
  candidacyId,
  fundingRequest,
}: FundingRequestUnifvaeInputCompleted) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    select: {
      financeModule: true,
      basicSkills: true,
      trainings: true,
      otherTraining: true,
      certificateSkills: true,
      candidate: true,
    },
  });
  if (candidacy === null) {
    throw new Error(`Candidacy ${candidacyId} not found`);
  }
  const fundreq = await prismaClient.fundingRequestUnifvae.create({
    data: {
      candidacyId,
      numAction: await getNextNumAction(),
      otherTraining: candidacy.otherTraining ?? "",
      certificateSkills: candidacy.certificateSkills ?? "",
      ...fundingRequest,
      candidateFirstname: candidacy.candidate?.firstname,
      candidateLastname: candidacy.candidate?.lastname,
    },
  });

  await prismaClient.$transaction([
    prismaClient.basicSkillOnFundingRequestsUnifvae.createMany({
      data: candidacy.basicSkills.map(({ basicSkillId }) => ({
        basicSkillId,
        fundingRequestUnifvaeId: fundreq.id,
      })),
    }),
    prismaClient.trainingOnFundingRequestsUnifvae.createMany({
      data: candidacy.trainings.map(({ trainingId }) => ({
        trainingId,
        fundingRequestUnifvaeId: fundreq.id,
      })),
    }),
    prismaClient.candidate.update({
      where: { id: (candidacy.candidate as Candidate).id },
      data: {
        gender: fundingRequest.candidateGender,
        firstname2: fundingRequest.candidateSecondname,
        firstname3: fundingRequest.candidateThirdname,
      },
    }),
  ]);
  await updateCandidacyStatus({
    candidacyId,
    status: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  await createBatchFromFundingRequestUnifvae(fundreq.id);

  return prismaClient.fundingRequestUnifvae.findUnique({
    where: {
      id: fundreq.id,
    },
    include: {
      basicSkills: {
        select: {
          basicSkill: true,
        },
      },
      mandatoryTrainings: {
        select: {
          training: true,
        },
      },
    },
  });
};

export const getFundingRequestUnifvaeFromCandidacyId = async (
  candidacyId: string
) =>
  prismaClient.fundingRequestUnifvae.findFirst({
    where: { candidacyId },
    include: {
      basicSkills: { include: { basicSkill: true } },
      mandatoryTrainings: { include: { training: true } },
    },
  });

async function getNextNumAction() {
  const nextValQueryResult =
    (await prismaClient.$queryRaw`Select nextval('funding_request_unifvae_num_action_sequence')`) as {
      nextval: number;
    }[];
  return `reva_${format(new Date(), "yyyyMMdd")}_${nextValQueryResult[0].nextval
    .toString()
    .padStart(5, "0")}`;
}

export const getPaymentRequestUnifvaeFromCandidacyId = (candidacyId: string) =>
  prismaClient.paymentRequestUniFvae.findFirst({
    where: { candidacyId },
  });
