import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrganimsAccountInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getAgenciesInfoQuery = graphql(`
  query getAgenciesInfoAddUserAccountPage {
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
        }
      }
    }
  }
`);

const createUserAccountMutation = graphql(`
  mutation createOrganismAccountForAddUserAccountPage(
    $maisonMereAAPId: ID!
    $data: CreateOrganimsAccountInput!
  ) {
    organism_createAccount(maisonMereAAPId: $maisonMereAAPId, data: $data) {
      id
    }
  }
`);

export const useAddUserAccountPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: agenciesInfo } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(getAgenciesInfoQuery),
  });

  const createUserAccount = useMutation({
    mutationFn: (data: CreateOrganimsAccountInput) =>
      graphqlClient.request(createUserAccountMutation, {
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

  return { headAgency, nonHeadAgencies, createUserAccount };
};
