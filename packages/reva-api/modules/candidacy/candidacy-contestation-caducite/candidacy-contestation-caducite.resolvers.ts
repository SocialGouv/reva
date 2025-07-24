import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Candidacy } from "@prisma/client";

import { resolversSecurityMap } from "./candidacy-contestation-caducite.security";
import {
  CreateCandidacyContestationCaduciteInput,
  UpdateCandidacyContestationCaduciteInput,
} from "./candidacy-contestation-caducite.types";
import { createCandidacyContestationCaducite } from "./features/createCandidacyContestationCaducite";
import { getCandidacyContestationsCaduciteByCandidacyId } from "./features/getCandidacyContestationsCaduciteByCandidacyId";
import { updateContestationCertificationAuthorityDecision } from "./features/updateContestationCertificationAuthorityDecision";

const unsafeResolvers = {
  Candidacy: {
    candidacyContestationsCaducite: ({ id: candidacyId }: Candidacy) =>
      getCandidacyContestationsCaduciteByCandidacyId({ candidacyId }),
  },
  Mutation: {
    candidacy_contestation_caducite_create_contestation: (
      _: unknown,
      input: CreateCandidacyContestationCaduciteInput,
      context: GraphqlContext,
    ) => createCandidacyContestationCaducite({ input, context }),
    candidacy_contestation_caducite_update_certification_authority_contestation_decision:
      (
        _: unknown,
        input: UpdateCandidacyContestationCaduciteInput,
        context: GraphqlContext,
      ) => updateContestationCertificationAuthorityDecision({ input, context }),
  },
};

export const candidacyContestationCaduciteResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
