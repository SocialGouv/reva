import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateOrganimsAccountAndOrganismInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

const updateUserAccountMutation = graphql(`
  mutation updateUserAccountForUpdateUserAccountPage(
    $maisonMereAAPId: ID!
    $data: UpdateOrganimsAccountAndOrganismInput!
  ) {
    organism_updateAccountAndOrganism(
      maisonMereAAPId: $maisonMereAAPId
      data: $data
    ) {
      id
    }
  }
`);

export const useUpdateUserAccountPage = ({
  userAccountId,
}: {
  userAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: agenciesInfo, status: agenciesInfoStatus } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(getAgenciesInfoQuery),
  });

  const updateUserAccount = useMutation({
    mutationFn: (data: UpdateOrganimsAccountAndOrganismInput) =>
      graphqlClient.request(updateUserAccountMutation, {
        maisonMereAAPId:
          agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP?.id,
        data,
      }),
    mutationKey: ["organisms", "agencies-settings-add-user-account-page"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  const agencies =
    agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP
      ?.organisms || [];

  const headAgency = agencies.find((a) => a.isHeadAgency);
  const nonHeadAgencies = agencies.filter((a) => !a.isHeadAgency);

  const userAccount = agencies
    .flatMap((a) => a.accounts)
    .find((a) => a.id === userAccountId);

  return {
    headAgency,
    nonHeadAgencies,
    userAccount,
    agenciesInfoStatus,
    updateUserAccount,
  };
};
