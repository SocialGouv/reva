import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { Candidacy } from "../candidacy.types";

import { confirmTrainingFormByCandidate } from "./features/confirmTrainingFormByCandidate";
import { getBasicSkills } from "./features/getBasicSkills";
import { getBasicSkillsByCandidacyId } from "./features/getBasicSkillsByCandidacyId";
import { getMandatoryTrainingsByCandidacyId } from "./features/getMandatoryTrainingsByCandidacyId ";
import { getTrainings } from "./features/getTrainings";
import { submitTraining } from "./features/submitTrainingForm";
import { resolversSecurityMap } from "./training.security";

const unsafeResolvers = {
  Candidacy: {
    mandatoryTrainings: async ({ id: candidacyId }: Candidacy) =>
      getMandatoryTrainingsByCandidacyId({ candidacyId }),
    basicSkills: async ({ id: candidacyId }: Candidacy) =>
      getBasicSkillsByCandidacyId({ candidacyId }),
  },
  Query: {
    training_getTrainings: getTrainings,
    getBasicSkills,
  },
  Mutation: {
    training_submitTrainingForm: async (
      _: unknown,
      payload: { candidacyId: string; training: any },
      context: GraphqlContext,
    ) =>
      submitTraining({
        candidacyId: payload.candidacyId,
        training: payload.training,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
      }),

    training_confirmTrainingForm: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) =>
      confirmTrainingFormByCandidate({
        candidacyId: candidacyId,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
      }),
  },
};

export const trainingResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
