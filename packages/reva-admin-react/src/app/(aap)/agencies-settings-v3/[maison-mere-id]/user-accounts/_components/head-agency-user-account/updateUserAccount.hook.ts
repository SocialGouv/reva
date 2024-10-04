import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateOrganimsAccountAndOrganismInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

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

const getMaisonMereAAPUpdateUserAccountPageAdminQuery = graphql(`
  query getMaisonMereAAPUpdateUserAccountPageAdmin($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
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
  const { isAdmin } = useAuth();

  const { "maison-mere-id": maisonMereAAPId }: { "maison-mere-id": string } =
    useParams();

  const { data: agenciesInfo, status: agenciesInfoStatus } = useQuery({
    queryKey: ["organisms", "updateUserAccount"],
    queryFn: () => graphqlClient.request(getAgenciesInfoQuery),
  });

  const { data: maisonMereAAPAdmin, status: maisonMereAAPAdminStatus } =
    useQuery({
      queryKey: [maisonMereAAPId, "maisonMereAAP", "UpdateUserAccountPage"],
      queryFn: () =>
        graphqlClient.request(getMaisonMereAAPUpdateUserAccountPageAdminQuery, {
          maisonMereAAPId,
        }),
      enabled: isAdmin,
    });

  const updateUserAccount = useMutation({
    mutationFn: (data: UpdateOrganimsAccountAndOrganismInput) =>
      graphqlClient.request(updateUserAccountMutation, {
        maisonMereAAPId:
          agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP?.id,
        data,
      }),
    mutationKey: ["organisms", "agencies-settings-add-user-account-page"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisms"] });
      queryClient.invalidateQueries({ queryKey: [maisonMereAAPId] });
    },
  });

  let maisonMereAAP =
    agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP;
  if (isAdmin) {
    maisonMereAAP = maisonMereAAPAdmin?.organism_getMaisonMereAAPById;
  } else {
    maisonMereAAP =
      agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP;
  }

  const agencies = maisonMereAAP?.organisms || [];

  const headAgency = agencies.find((a) => a.isHeadAgency);
  const nonHeadAgencies = agencies.filter((a) => !a.isHeadAgency);

  const userAccount = agencies
    .flatMap((a) => a.accounts)
    .find((a) => a.id === userAccountId);

  const agenciesInfoIsSuccess =
    agenciesInfoStatus === "success" || maisonMereAAPAdminStatus === "success";

  return {
    headAgency,
    nonHeadAgencies,
    userAccount,
    agenciesInfoIsSuccess,
    updateUserAccount,
    isAdmin,
    maisonMereAAPId,
  };
};
