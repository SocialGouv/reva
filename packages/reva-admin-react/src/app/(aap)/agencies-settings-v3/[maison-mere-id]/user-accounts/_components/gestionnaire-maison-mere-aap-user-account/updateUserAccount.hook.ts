import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateOrganimsAccountAndOrganismInput } from "@/graphql/generated/graphql";

const getAgenciesInfoQuery = graphql(`
  query getAgenciesInfoForUpdateUserAccountPage {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
        organisms {
          id
          modaliteAccompagnement
          label
          nomPublic
          accounts {
            id
            firstname
            lastname
            email
            disabledAt
            organisms {
              id
              modaliteAccompagnement
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
        modaliteAccompagnement
        label
        nomPublic
        accounts {
          id
          firstname
          lastname
          email
          disabledAt
          organisms {
            id
            modaliteAccompagnement
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
        maisonMereAAPId,
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

  const remoteOrganism = agencies.find(
    (o) => o.modaliteAccompagnement === "A_DISTANCE",
  );
  const onSiteOrganisms = agencies.filter(
    (o) => o.modaliteAccompagnement === "LIEU_ACCUEIL",
  );

  const userAccount = agencies
    .flatMap((a) => a.accounts)
    .find((a) => a.id === userAccountId);

  const agenciesInfoIsSuccess =
    agenciesInfoStatus === "success" || maisonMereAAPAdminStatus === "success";

  return {
    remoteOrganism,
    onSiteOrganisms,
    userAccount,
    agenciesInfoIsSuccess,
    updateUserAccount,
    isAdmin,
    maisonMereAAPId,
  };
};
