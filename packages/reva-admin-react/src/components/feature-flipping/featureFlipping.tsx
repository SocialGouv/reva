import { graphql } from "@/graphql/generated";
import { create } from "zustand";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { GraphQLClient } from "graphql-request";
import { useSession } from "next-auth/react";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

const useFeatureFlippingStore = create<{
  activeFeatures: string[];
  status: "NOT_INITIALIZED" | "INITIALIZED" | "LOADING";
  init: (graphqlClient: GraphQLClient) => Promise<void>;
  isFeatureActive: (featureName: string) => boolean;
}>((set, get) => ({
  activeFeatures: [],
  status: "NOT_INITIALIZED",
  init: async (graphqlClient) => {
    if (get().status === "NOT_INITIALIZED") {
      set({ status: "LOADING" });
      const result = await graphqlClient.request(activeFeaturesQuery);
      set({
        activeFeatures: result.activeFeaturesForConnectedUser,
        status: "INITIALIZED",
      });
    }
  },
  isFeatureActive: (featureName: string) =>
    get().activeFeatures.includes(featureName),
}));

export const useFeatureflipping = () => {
  const { activeFeatures, isFeatureActive, init } = useFeatureFlippingStore();
  const { graphqlClient } = useGraphQlClient();
  const { status } = useSession();
  if (status === "authenticated") {
    init(graphqlClient);
  }
  return { activeFeatures, isFeatureActive };
};
