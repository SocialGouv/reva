import { composeResolvers } from "@graphql-tools/resolvers-composition";
import mercurius from "mercurius";

import { prismaClient } from "../../../prisma/client";
import { CandidacyBusinessEvent } from "../../candidacy/candidacy.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { isAdminOrCandidacyCompanion } from "../../shared/security/presets";
import {
  createFundingRequestUnifvae,
  getFundingRequestUnifvaeFromCandidacyId,
} from "./features/finance.unifvae.features";
import { logFundingRequestUnifvaeEvent } from "./logFundingRequestUnifvaeEvent";
import applyBusinessValidationRules from "./validation";

const withSkillsAndTrainings = (f: any) =>
  f
    ? {
        ...f,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        basicSkills: f.basicSkills.map((bs) => ({
          id: bs.basicSkillId,
          label: bs.basicSkill.label,
        })),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mandatoryTrainings: f.mandatoryTrainings.map((mt) => ({
          id: mt.trainingId,
          label: mt.training.label,
        })),
      }
    : null;

const unsafeResolvers = {
  Candidacy: {
    fundingRequestUnifvae: async ({ id: candidacyId }: { id: string }) =>
      withSkillsAndTrainings(
        await getFundingRequestUnifvaeFromCandidacyId(candidacyId)
      ),
  },

  Query: {
    candidacy_getFundingRequestUnifvae: async (
      _: unknown,
      payload: { candidacyId: string }
    ) => {
      const fundreq = await getFundingRequestUnifvaeFromCandidacyId(
        payload.candidacyId
      );
      return withSkillsAndTrainings(fundreq);
    },
  },
  Mutation: {
    candidacy_createFundingRequestUnifvae: async (
      _: unknown,
      payload: FundingRequestUnifvaeInput,
      context: GraphqlContext
    ) => {
      const candidacy = await prismaClient.candidacy.findUnique({
        where: { id: payload.candidacyId },
      });
      const fundingRequestCompleted: FundingRequestUnifvaeInputCompleted =
        Object.assign(
          {},
          {
            candidacyId: payload.candidacyId,
            fundingRequest: {
              ...payload.fundingRequest,
              isPartialCertification: Boolean(
                candidacy?.isCertificationPartial
              ),
            },
          }
        );
      const validationErrors = applyBusinessValidationRules(
        fundingRequestCompleted
      );
      if (validationErrors.length) {
        const businessErrors = validationErrors.map(({ fieldName, message }) =>
          fieldName === "GLOBAL" ? message : `input.${fieldName}: ${message}`
        );
        return new mercurius.ErrorWithProps(businessErrors[0], {
          businessErrors,
        });
      }
      try {
        const fundreq = await createFundingRequestUnifvae(
          fundingRequestCompleted
        );
        logFundingRequestUnifvaeEvent({
          context,
          eventType: CandidacyBusinessEvent.CREATED_FUNDING_REQUEST_UNIFVAE,
          candidacyId: payload.candidacyId,
          result: fundreq as Record<string, unknown>,
        });
        return fundreq;
      } catch (error: any) {
        logFundingRequestUnifvaeEvent({
          context,
          eventType: CandidacyBusinessEvent.CREATED_FUNDING_REQUEST_UNIFVAE,
          candidacyId: payload.candidacyId,
          result: new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            error.message
          ),
        });
        return new mercurius.ErrorWithProps(error.message, error);
      }
    },
  },
};

export const financeUnifvaeResolvers = composeResolvers(unsafeResolvers, {
  "Mutation.candidacy_createFundingRequestUnifvae": isAdminOrCandidacyCompanion,
  "Query.candidacy_getFundingRequestUnifvae": isAdminOrCandidacyCompanion,
});
