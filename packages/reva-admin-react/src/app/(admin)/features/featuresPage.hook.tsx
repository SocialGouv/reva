import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";

const getFeaturesQuery = graphql(`
  query getFeaturesForFeaturesPage {
    featureFlipping_getFeatures {
      key
      label
      isActive
    }
  }
`);

const toggleFeatureMutation = graphql(`
  mutation toggleFeature($featureKey: String!, $isActive: Boolean!) {
    featureFlipping_toggleFeature(
      featureKey: $featureKey
      isActive: $isActive
    ) {
      key
      label
      isActive
    }
  }
`);

export const useFeaturesPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getFeaturesResponse, status: getFeaturesStatus } = useQuery({
    queryKey: ["features"],
    queryFn: () => graphqlClient.request(getFeaturesQuery),
  });

  const features = getFeaturesResponse?.featureFlipping_getFeatures || [];

  const toggleFeature = useMutation({
    mutationFn: ({
      featureKey,
      isActive,
    }: {
      featureKey: string;
      isActive: boolean;
    }) =>
      graphqlClient.request(toggleFeatureMutation, {
        featureKey,
        isActive,
      }),
  });

  return {
    features,
    getFeaturesStatus,
    toggleFeature,
  };
};
