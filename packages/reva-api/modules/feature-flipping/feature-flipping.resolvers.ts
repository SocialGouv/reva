import { activeFeaturesForConnectedUser } from "./feature-flipping.features";

export const featureFlippingResolvers = {
  Query: {
    activeFeaturesForConnectedUser: (
      _parent: unknown,
      _args: unknown,
      context: GraphqlContext
    ) =>
      activeFeaturesForConnectedUser({
        userKeycloakId: context.auth.userInfo?.sub,
      }),
  },
};
