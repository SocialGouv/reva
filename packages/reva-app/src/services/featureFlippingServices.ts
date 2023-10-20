import { ApolloClient, gql } from "@apollo/client";

const GET_ACTIVE_FEATURES_FOR_CONNECTED_USER = gql`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`;

export const getActiveFeaturesForConnectedUser =
  (client: ApolloClient<object>) => async (params: { token?: string }) => {
    const { data } = await client.query({
      context: params.token
        ? {
            headers: {
              authorization: `Bearer ${params.token}`,
            },
          }
        : undefined,
      query: GET_ACTIVE_FEATURES_FOR_CONNECTED_USER,
    });

    return data.activeFeaturesForConnectedUser;
  };
