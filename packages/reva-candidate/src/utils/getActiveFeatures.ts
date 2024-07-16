import { cache } from 'react';
import { getGraphQlClient } from './graphql-client-server';
import { graphql } from '@/graphql/generated';

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

export const getActiveFeatures = cache(async () => {
  const graphqlClient = getGraphQlClient();

  const activeFeatures = await graphqlClient.request(activeFeaturesQuery);
  return activeFeatures.activeFeaturesForConnectedUser;
});

export const isFeatureActive = async (key: string) => {
  const activeFeatures = await getActiveFeatures();
  return activeFeatures.includes(key);
}