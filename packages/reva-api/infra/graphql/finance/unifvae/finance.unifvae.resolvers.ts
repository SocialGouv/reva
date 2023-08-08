import { composeResolvers } from "@graphql-tools/resolvers-composition";
import mercurius from "mercurius";
import { Left, Right } from "purify-ts";

import { CandidacyBusinessEvent } from "../../../../domain/types/candidacy";
import { isAdminOrCandidacyCompanion } from "../../security/presets";
import { createFundingRequestUnifvae } from "./finance.unifvae.features";
import { logFundingRequestUnifvaeEvent } from "./logFundingRequestUnifvaeEvent";

const unsafeResolvers = {
  Mutation: {
    candidacy_createFundingRequestUnifvae: async (
      _: unknown,
      payload: FundingRequestUnifvaeInput,
      context: GraphqlContext
    ) => {
      try {
        const fundreq = await createFundingRequestUnifvae(payload);
        logFundingRequestUnifvaeEvent({
          context,
          eventType: CandidacyBusinessEvent.CREATED_FUNDING_REQUEST_UNIFVAE,
          candidacyId: payload.candidacyId,
          result: Right(fundreq as Record<string, unknown>),
        });
        return fundreq;
      } catch (error: any) {
        logFundingRequestUnifvaeEvent({
          context,
          eventType: CandidacyBusinessEvent.CREATED_FUNDING_REQUEST_UNIFVAE,
          candidacyId: payload.candidacyId,
          result: Left(error.message),
        });
        return new mercurius.ErrorWithProps(error.message, error);
      }
    },
  },
};

export const financeUnifvaeResolvers = composeResolvers(unsafeResolvers, {
  "Mutation.candidacy_createFundingRequestUnifvae": isAdminOrCandidacyCompanion,
});
