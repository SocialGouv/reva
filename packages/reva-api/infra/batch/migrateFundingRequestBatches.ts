import pino from "pino";

import { mapFundingRequestBatch } from "../../domain/features/createFundingRequest";
import { Candidacy } from "../../domain/types/candidacy";
import { Candidate } from "../../domain/types/candidate";
import { getCandidacyFromId } from "../database/postgres/candidacies";
import { getCandidateByCandidacyId } from "../database/postgres/candidates";
import { prismaClient } from "../database/postgres/client";

//Create the missing funding request batch entries
//Remove the whole file after putting it into production
const logger = pino();

export const migrateFundingRequestBatches = async () => {
  logger.info("starting funding request batches migration");
  try {
    const fundingRequestsWithBatchesIds = (
      await prismaClient.fundingRequestBatch.findMany({
        select: { fundingRequestId: true },
      })
    ).map((f) => f.fundingRequestId);

    const fundingRequestsWithoutBatches =
      await prismaClient.fundingRequest.findMany({
        where: { id: { notIn: fundingRequestsWithBatchesIds } },
        include: {
          basicSkills: { include: { basicSkill: true } },
          mandatoryTrainings: { include: { training: true } },
        },
      });

    for (const fundingRequest of fundingRequestsWithoutBatches) {
      logger.info(
        `creating funding request batch for funding request ${fundingRequest.id}`
      );
      try {
        const candidacy = (await (
          await getCandidacyFromId(fundingRequest.candidacyId)
        ).extract()) as Candidacy;
        const candidate = (await (
          await getCandidateByCandidacyId(fundingRequest.candidacyId)
        ).extract()) as Candidate;

        const fundingRequestWithBasicSkillsAndMandatoryTrainings = {
          ...fundingRequest,
          basicSkills: fundingRequest?.basicSkills.map((b) => b.basicSkill),
          mandatoryTrainings: fundingRequest?.mandatoryTrainings.map(
            (t) => t.training
          ),
        };

        const fundingRequestBatch = mapFundingRequestBatch({
          fundingRequest: fundingRequestWithBasicSkillsAndMandatoryTrainings,
          candidacy,
          candidate,
        });
        await prismaClient.fundingRequestBatch.create({
          data: {
            fundingRequestId: fundingRequest.id,
            content: fundingRequestBatch as object,
          },
        });
      } catch (e) {
        logger.error(e);
      }
    }
  } catch (e) {
    logger.error(e);
  }
  logger.info("ending funding request batches migration");
};
