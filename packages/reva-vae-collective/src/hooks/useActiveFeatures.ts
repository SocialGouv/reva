import { useEffect, useState } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

import { graphql } from "@/graphql/generated";

import { throwUrqlErrors } from "../helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "../helpers/graphql/urql-client/urqlClient";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

const isFeatureActive = (activeFeatures: string[], featureName: string) =>
  activeFeatures.includes(featureName);

export function useActiveFeatures() {
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { accessToken } = useKeycloakContext();

  useEffect(() => {
    const fetchActiveFeatures = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!accessToken) {
          setActiveFeatures([]);
          setLoading(false);
          return;
        }

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

        const features = result.data?.activeFeaturesForConnectedUser || [];
        setActiveFeatures(features);
      } catch (err) {
        console.error("Failed to fetch active features:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setActiveFeatures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveFeatures();
  }, [accessToken]);

  return {
    activeFeatures,
    isFeatureActive: (featureName: string) =>
      isFeatureActive(activeFeatures, featureName),
    loading,
    error,
  };
}
