import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";

const GET_DEPARTMENT = graphql(`
  query getDepartments {
    getDepartments {
      id
      code
      label
    }
  }
`);

export const getDepartments = async () => {
  const graphqlClient = getGraphQlClient();

  const departments = await graphqlClient.request(GET_DEPARTMENT)

  return departments.getDepartments;
};
