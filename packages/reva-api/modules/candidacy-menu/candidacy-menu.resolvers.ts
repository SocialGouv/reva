import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./candidacy-menu.security";
import { getCandidacyMenu } from "./features/getCandidacyMenu";

const unsafeResolvers = {
  Query: {
    candidacyMenu_getCandidacyMenu: async (
      _parent: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) =>
      getCandidacyMenu({
        candidacyId,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
        userKeycloakId: context.auth.userInfo?.sub,
      }),
  },
};

export const candidacyMenuResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
