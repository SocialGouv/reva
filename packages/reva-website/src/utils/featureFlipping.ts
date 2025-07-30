import request from "graphql-request";

import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

async function getActiveFeatures(): Promise<string[]> {
  const result = await request(GRAPHQL_API_URL, activeFeaturesQuery);
  return result.activeFeaturesForConnectedUser;
}

export async function isFeatureActive(featureName: string): Promise<boolean> {
  const activeFeatures = await getActiveFeatures();
  return activeFeatures.includes(featureName);
}
