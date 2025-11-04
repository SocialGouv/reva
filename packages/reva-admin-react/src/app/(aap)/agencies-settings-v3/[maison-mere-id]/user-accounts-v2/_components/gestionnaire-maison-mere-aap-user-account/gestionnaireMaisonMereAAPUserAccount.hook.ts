import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getMaisonMerAAPUserAccountsQuery = graphql(`
  query getMaisonMerAAPUserAccounts($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      organisms {
        id
        accounts {
          id
          firstname
          lastname
          organisms {
            id
          }
        }
      }
    }
  }
`);

export const useGestionnaireMaisonMereAAPUserAccount = ({
  maisonMereAAPId,
  userAccountId,
}: {
  maisonMereAAPId: string;
  userAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: maisonMerAAPUserAccounts } = useQuery({
    queryKey: ["maisonMerAAPUserAccounts", maisonMereAAPId],
    queryFn: () =>
      graphqlClient.request(getMaisonMerAAPUserAccountsQuery, {
        maisonMereAAPId,
      }),
  });

  const userAccounts =
    maisonMerAAPUserAccounts?.organism_getMaisonMereAAPById?.organisms?.flatMap(
      (o) => o.accounts,
    );

  const userAccount = userAccounts?.find((a) => a.id === userAccountId);

  return {
    maisonMerAAPUserAccounts,
    userAccount,
  };
};
