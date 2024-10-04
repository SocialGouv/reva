import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrganimsAccountInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getMaisonMereAAPAddUserAccountPageAdminQuery = graphql(`
  query getMaisonMereAAPAddUserAccountPageAdmin($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
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
`);

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
  const { isAdmin } = useAuth();
  const { "maison-mere-id": maisonMereAAPId }: { "maison-mere-id": string } =
    useParams();

  const { data: agenciesInfo } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(getAgenciesInfoQuery),
  });

  const { data: maisonMereAAPAddUserAccountPageAdminInformation } = useQuery({
    queryKey: [
      maisonMereAAPId,
      "maisonMereAAPAddUserAccountPageAdminInformation",
    ],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPAddUserAccountPageAdminQuery, {
        maisonMereAAPId,
      }),
    enabled: isAdmin,
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

  let maisonMereAAP;
  if (isAdmin) {
    maisonMereAAP =
      maisonMereAAPAddUserAccountPageAdminInformation?.organism_getMaisonMereAAPById;
  } else {
    maisonMereAAP =
      agenciesInfo?.account_getAccountForConnectedUser?.maisonMereAAP;
  }

  const agencies = maisonMereAAP?.organisms || [];

  const headAgency = agencies.find((a) => a.isHeadAgency);
  const nonHeadAgencies = agencies.filter((a) => !a.isHeadAgency);

  return {
    headAgency,
    nonHeadAgencies,
    createUserAccount,
    isAdmin,
    maisonMereAAPId,
  };
};
