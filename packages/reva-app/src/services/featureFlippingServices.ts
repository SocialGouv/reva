import { ApolloClient, gql } from "@apollo/client";

const GET_ACTIVE_FEATURES_FOR_CONNECTED_USER = gql`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`;

export const getActiveFeaturesForConnectedUser = async (
  client: ApolloClient<object>
) => {
  const { data } = await client.query({
    query: GET_ACTIVE_FEATURES_FOR_CONNECTED_USER,
  });

  return data.activeFeaturesForConnectedUser;
};
