import { graphql } from "@/graphql/generated";

import { useUrqlClient } from "@/components/graphql/urql-client/UrqlClient";

const CREATE_OR_UPDATE_SWORN_STATEMENT = graphql(`
  mutation dematerialized_feasibility_file_createOrUpdateSwornStatement(
    $candidacyId: ID!
    $swornStatement: Upload!
  ) {
    dematerialized_feasibility_file_createOrUpdateSwornStatement(
      candidacyId: $candidacyId
      input: { swornStatement: $swornStatement }
    ) {
      id
    }
  }
`);

export const useValidateFeasibility = () => {
  const urqlClient = useUrqlClient();

  const createOrUpdateSwornStatement = ({
    candidacyId,
    swornStatement,
  }: {
    candidacyId: string;
    swornStatement: File;
  }) =>
    urqlClient.mutation(CREATE_OR_UPDATE_SWORN_STATEMENT, {
      candidacyId,
      swornStatement,
    });

  return { createOrUpdateSwornStatement };
};
