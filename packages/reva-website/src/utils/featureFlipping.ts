import request from "graphql-request";

import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

async function getActiveFeatures(): Promise<string[]> {
  // Wrapped in a try catch to avoid the app crashing if the feature flipping API is down.
  // This happens when running playwright tests if the home page (a server component) uses the feature flipping API.
  try {
    const result = await request(GRAPHQL_API_URL, activeFeaturesQuery);
    return result.activeFeaturesForConnectedUser;
  } catch (error) {
    console.error("Failed to fetch active features:", error);
    return [];
  }
}

export async function isFeatureActive(featureName: string): Promise<boolean> {
  const activeFeatures = await getActiveFeatures();
  return activeFeatures.includes(featureName);
}
