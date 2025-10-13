"use server";
import { graphql } from "@/graphql/generated";

import { getAccessTokenFromCookie } from "./auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "./graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "./graphql/urql-client/urqlClient";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

const isFeatureActive = (activeFeatures: string[], featureName: string) =>
  activeFeatures.includes(featureName);

export async function getActiveFeatures(): Promise<{
  activeFeatures: string[];
  isFeatureActive: (activeFeatures: string[], featureName: string) => boolean;
}> {
  const accessToken = await getAccessTokenFromCookie();
  const result = { activeFeatures: [], isFeatureActive };

  if (!accessToken) {
    return result;
  }

  try {
    const result = throwUrqlErrors(
      await client.query(
        activeFeaturesQuery,
        {},
        {
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        },
      ),
    );

    const activeFeatures = result.data?.activeFeaturesForConnectedUser || [];

    return { activeFeatures, isFeatureActive };
  } catch (error) {
    console.error("Failed to fetch active features:", error);
    return result;
  }
}
