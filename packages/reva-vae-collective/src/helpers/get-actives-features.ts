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

export async function getActiveFeatures(): Promise<{
  activeFeatures: string[];
  isFeatureActive: (featureName: string) => boolean;
}> {
  const accessToken = await getAccessTokenFromCookie();
  const result = {
    activeFeatures: [],
    isFeatureActive: (_featureName: string) => false,
  };

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
    const isFeatureActive = (featureName: string) =>
      activeFeatures.includes(featureName);

    return { activeFeatures, isFeatureActive };
  } catch (error) {
    console.error("Failed to fetch active features:", error);
    return result;
  }
}
