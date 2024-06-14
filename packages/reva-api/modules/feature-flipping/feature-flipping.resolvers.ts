import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  activeFeaturesForConnectedUser,
  getFeatures,
  toggleFeature,
} from "./feature-flipping.features";
import { featureFlippingResolversSecurityMap } from "./feature-filipping.security";

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

export const featureFlippingResolvers = composeResolvers(
  unsafeResolvers,
  featureFlippingResolversSecurityMap,
);
