import { useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const GET_DEPARTMENT = graphql(`
  query getDepartments {
    getDepartments {
      id
      code
      label
    }
  }
`);

export const useSelectDepartment = () => {
  const { graphqlClient } = useGraphQlClient();

  const departments = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => graphqlClient.request(GET_DEPARTMENT),
  });

  return { departments };
};
