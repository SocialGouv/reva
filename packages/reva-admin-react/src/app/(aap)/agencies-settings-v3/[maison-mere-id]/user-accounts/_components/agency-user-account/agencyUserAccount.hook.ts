import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useSuspenseQuery } from "@tanstack/react-query";

const getAgenciesInfoQuery = graphql(`
  query getAgenciesInfoForUserAccountPage {
    account_getAccountForConnectedUser {
      id
      firstname
      lastname
      email
      organism {
        id
        isHeadAgency
        label
        informationsCommerciales {
          nom
        }
      }
      maisonMereAAP {
        id
      }
    }
  }
`);

export const useUpdateUserAccountPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: agenciesInfo, status: agenciesInfoStatus } = useSuspenseQuery({
    queryKey: ["organisms", "updateUserAccount"],
    queryFn: () => graphqlClient.request(getAgenciesInfoQuery),
  });

  const userAccount = agenciesInfo?.account_getAccountForConnectedUser;

  return {
    userAccount,
    agenciesInfoStatus,
  };
};
