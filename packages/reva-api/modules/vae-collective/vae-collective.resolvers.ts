import { GraphQLResolveInfo } from "graphql";
import { getCohorteVAECollectiveByCodeInscription } from "./features/getCohorteVAECollectiveByCodeInscription";
import { vaeCollectiveResolversSecurityMap } from "./vae-collective.security";
import { composeResolvers } from "@graphql-tools/resolvers-composition";

const unsafeResolvers = {
  Query: {
    cohorteVaeCollective: async (
      _parent: unknown,
      { codeInscription }: { codeInscription: string },
      _context: unknown,
      _info: GraphQLResolveInfo,
    ) =>
      getCohorteVAECollectiveByCodeInscription({
        codeInscription,
      }),
  },
};

export const vaeCollectiveResolvers = composeResolvers(
  unsafeResolvers,
  vaeCollectiveResolversSecurityMap,
);
