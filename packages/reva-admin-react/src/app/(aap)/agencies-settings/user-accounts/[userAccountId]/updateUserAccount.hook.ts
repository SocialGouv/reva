import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getAgenciesInfoQuery = graphql(`
  query getAgenciesInfoForUpdateUserAccountPage {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
        organisms {
          id
          isHeadAgency
          label
          informationsCommerciales {
            nom
          }
          accounts {
            id
            firstname
            lastname
            email
            organism {
              id
              isHeadAgency
            }
          }
        }
      }
    }
  }
`);

export const useUpdateUserAccountPage = ({
  userAccountId,
}: {
  userAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: agenciesInfo } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(getAgenciesInfoQuery),
  });

  const agencies =
    agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP
      ?.organisms || [];

  const headAgency = agencies.find((a) => a.isHeadAgency);
  const nonHeadAgencies = agencies.filter((a) => !a.isHeadAgency);

  const userAccount = agencies
    .flatMap((a) => a.accounts)
    .find((a) => a.id === userAccountId);

  return { headAgency, nonHeadAgencies, userAccount };
};
