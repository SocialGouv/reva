import { composeResolvers } from "@graphql-tools/resolvers-composition";
import mercurius from "mercurius";

import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { generateJwt } from "../../candidate/auth.helper";
import { Candidacy } from "../candidacy.types";
import { getCandidacyById } from "../features/getCandidacyById";
import { sendTrainingEmail } from "./emails";
import { getMandatoryTrainingsByCandidacyId } from "./features/getMandatoryTrainingsByCandidacyId ";
import { getTrainings } from "./features/getTrainings";
import { submitTraining } from "./features/submitTrainingForm";
import { validateTrainingFormByCandidate } from "./features/validateTrainingFormByCandidate";
import { resolversSecurityMap } from "./training.security";

const unsafeResolvers = {
  Candidacy: {
    mandatoryTrainings: async ({ id: candidacyId }: Candidacy) =>
      getMandatoryTrainingsByCandidacyId({ candidacyId }),
  },
  Query: {
    training_getTrainings: getTrainings,
  },
  Mutation: {
    training_submitTrainingForm: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) => {
      try {
        await submitTraining({
          candidacyId: payload.candidacyId,
          training: payload.training,
        });

        const candidacy = await getCandidacyById({
          candidacyId: payload.candidacyId,
        });

        if (candidacy?.email) {
          const token = generateJwt(
            { email: candidacy.email, action: "login" },
            1 * 60 * 60 * 24 * 4,
          );
          sendTrainingEmail(candidacy.email, token);
        }

        await logCandidacyAuditEvent({
          candidacyId: payload.candidacyId,
          eventType: "TRAINING_FORM_SUBMITTED",
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new mercurius.ErrorWithProps(error.message, error);
        }
        throw error;
      }
    },

    training_confirmTrainingForm: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) => {
      try {
        const result = await validateTrainingFormByCandidate({
          candidacyId: candidacyId,
        });

        await logCandidacyAuditEvent({
          candidacyId,
          eventType: "TRAINING_FORM_CONFIRMED",
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        });

        return result;
      } catch (error) {
        if (error instanceof Error) {
          throw new mercurius.ErrorWithProps(error.message, error);
        }
        throw error;
      }
    },
  },
};

export const trainingResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
