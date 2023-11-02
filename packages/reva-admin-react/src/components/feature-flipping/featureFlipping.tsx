import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";
import { create } from "zustand";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

const useFeatureFlippingStore = create<{
  activeFeatures: string[];
  initialized: boolean;
  init: () => Promise<void>;
}>((set, get) => ({
  activeFeatures: [],
  initialized: false,
  init: async () => {
    if (!get().initialized) {
      const result = await request(GRAPHQL_API_URL, activeFeaturesQuery);
      set({
        activeFeatures: result.activeFeaturesForConnectedUser,
        initialized: true,
      });
    }
  },
}));

export const useFeatureflipping = () => {
  const { activeFeatures, init } = useFeatureFlippingStore();
  init();
  return { activeFeatures };
};
