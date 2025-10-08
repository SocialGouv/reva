import { GraphQLClient } from "graphql-request";
import { useEffect } from "react";
import { create } from "zustand";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import {
  useAnonymousGraphQlClient,
  useGraphQlClient,
} from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

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

export const useFeatureFlipping = () => {
  const { activeFeatures, isFeatureActive, init, status } =
    useFeatureFlippingStore();
  const { graphqlClient } = useGraphQlClient();
  const { authenticated } = useKeycloakContext();

  useEffect(() => {
    if (authenticated) {
      init(graphqlClient);
    }
  }, [authenticated, graphqlClient, init]);

  return { activeFeatures, isFeatureActive, status };
};

const useAnonymousFeatureFlippingStore = create<{
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

export const useAnonymousFeatureFlipping = () => {
  const { activeFeatures, isFeatureActive, init, status } =
    useAnonymousFeatureFlippingStore();
  const { graphqlClient } = useAnonymousGraphQlClient();

  init(graphqlClient);

  return { activeFeatures, isFeatureActive, status };
};
