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

export const getDepartments = async (client: ApolloClient<object>) => {
  const { data } = await client.query({
    query: GET_DEPARTMENTS,
  });

  return {
    departments: data.getDepartments,
  };
};
