import { activeFeaturesForConnectedUser } from "./feature-flipping.features";

export const featureFlippingResolvers = {
  Query: {
    activeFeaturesForConnectedUser: () => activeFeaturesForConnectedUser(),
  },
};
