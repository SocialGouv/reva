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
  status: "NOT_INITIALIZED" | "INITIALIZED" | "LOADING";
  init: () => Promise<void>;
}>((set, get) => ({
  activeFeatures: [],
  status: "NOT_INITIALIZED",
  init: async () => {
    if (get().status === "NOT_INITIALIZED") {
      set({ status: "LOADING" });
      const result = await request(GRAPHQL_API_URL, activeFeaturesQuery);
      set({
        activeFeatures: result.activeFeaturesForConnectedUser,
        status: "INITIALIZED",
      });
    }
  },
}));

export const useFeatureflipping = () => {
  const { activeFeatures, init } = useFeatureFlippingStore();
  init();
  return { activeFeatures };
};
