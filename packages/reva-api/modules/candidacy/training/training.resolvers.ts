import {
  isAnyone,
  isOwnerOrCanManageCandidacy,
} from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { Candidacy } from "../candidacy.types";

import { confirmTrainingFormByCandidate } from "./features/confirmTrainingFormByCandidate";
import { getBasicSkills } from "./features/getBasicSkills";
import { getBasicSkillsByCandidacyId } from "./features/getBasicSkillsByCandidacyId";
import { getMandatoryTrainingsByCandidacyId } from "./features/getMandatoryTrainingsByCandidacyId ";
import { getTrainings } from "./features/getTrainings";
import { submitTraining } from "./features/submitTrainingForm";

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

export const trainingResolvers = withPolicies(unsafeResolvers, {
  // Reached only through a Candidacy object from an already-gated resolver (e.g.
  // getCandidacyById, protected by canAccessCandidacy), whose allowed roles are broader
  // than isOwnerOrCanManageCandidacy (certificateurs, maison mere managers, ...).
  Candidacy: {
    mandatoryTrainings: isAnyone,
    basicSkills: isAnyone,
  },
  Query: {
    training_getTrainings: isAnyone,
    getBasicSkills: isAnyone,
  },
  Mutation: {
    training_submitTrainingForm: isOwnerOrCanManageCandidacy,
    training_confirmTrainingForm: isOwnerOrCanManageCandidacy,
  },
});
