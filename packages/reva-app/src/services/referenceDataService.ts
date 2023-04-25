import { ApolloClient, gql } from "@apollo/client";

const GET_DEPARTMENTS = gql`
  query getDepartments {
    getDepartments {
      id
      code
      label
    }
  }
`;

export const getDepartments =
  (client: ApolloClient<object>) => async (params: { token?: string }) => {
    const { data } = await client.query({
      context: params.token
        ? {
            headers: {
              authorization: `Bearer ${params.token}`,
            },
          }
        : undefined,
      query: GET_DEPARTMENTS,
    });

    return {
      departments: data.getDepartments,
    };
  };
