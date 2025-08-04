import { Client } from "@urql/core";

import { AccountInput } from "../../../../graphql/generated/graphql.js";
import { graphql } from "../../../../graphql/generated/index.js";

const createAccountQuery = graphql(`
  mutation createAccountQuery($account: AccountInput!) {
    account_createAccount(account: $account) {
      id
      keycloakId
    }
  }
`);

export const createAccount = async (
  graphqlClient: Client,
  account: AccountInput & { certificationAuthorityId: string },
) => {
  const r = await graphqlClient.mutation(createAccountQuery, { account });
  if (r.error) {
    throw r.error;
  }
  return r.data?.account_createAccount;
};
