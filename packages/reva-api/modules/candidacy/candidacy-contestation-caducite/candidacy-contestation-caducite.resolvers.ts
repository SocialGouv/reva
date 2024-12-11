import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { Candidacy } from "@prisma/client";
import { resolversSecurityMap } from "./candidacy-contestation-caducite.security";
import { CreateCandidacyContestationCaduciteInput } from "./candidacy-contestation-caducite.types";
import { createCandidacyContestationCaducite } from "./features/createCandidacyContestationCaducite";
import { getCandidacyContestationsCaduciteByCandidacyId } from "./features/getCandidacyContestationsCaduciteByCandidacyId";

const unsafeResolvers = {
  Candidacy: {
    candidacyContestationsCaducite: ({ id: candidacyId }: Candidacy) =>
      getCandidacyContestationsCaduciteByCandidacyId({ candidacyId }),
  },
  Mutation: {
    candidacy_contestation_caducite_create_contestation: (
      _: unknown,
      input: CreateCandidacyContestationCaduciteInput,
    ) => createCandidacyContestationCaducite(input),
  },
};

export const candidacyContestationCaduciteResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
