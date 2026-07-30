import { isAdminOrCandidacyCompanion } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

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
      }),
  },
};

export const candidacyMenuResolvers = withPolicies(unsafeResolvers, {
  Query: {
    candidacyMenu_getCandidacyMenu: isAdminOrCandidacyCompanion,
  },
});
