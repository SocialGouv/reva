import { isAdmin, isAnyone } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import {
  activeFeaturesForConnectedUser,
  getFeatures,
  toggleFeature,
} from "./feature-flipping.features";

const unsafeResolvers = {
  Query: {
    activeFeaturesForConnectedUser: (
      _parent: unknown,
      _args: unknown,
      context: GraphqlContext,
    ) =>
      activeFeaturesForConnectedUser({
        userKeycloakId: context.auth.userInfo?.sub,
      }),

    featureFlipping_getFeatures: getFeatures,
  },
  Mutation: {
    featureFlipping_toggleFeature: (
      _parent: unknown,
      params: {
        featureKey: string;
        isActive: boolean;
      },
    ) => toggleFeature(params),
  },
};

export const featureFlippingResolvers = withPolicies(unsafeResolvers, {
  Query: {
    // Consommé sans authentification par le site vitrine.
    activeFeaturesForConnectedUser: isAnyone,
    featureFlipping_getFeatures: isAdmin,
  },
  Mutation: { featureFlipping_toggleFeature: isAdmin },
});
