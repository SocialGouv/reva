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
        modaliteAccompagnement
        label
        nomPublic
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
          modaliteAccompagnement
          label
          nomPublic
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
        maisonMereAAPId,
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

  const remoteOrganism = agencies.find(
    (o) => o.modaliteAccompagnement === "A_DISTANCE",
  );
  const onSiteOrganisms = agencies.filter(
    (o) => o.modaliteAccompagnement === "LIEU_ACCUEIL",
  );

  return {
    remoteOrganism,
    onSiteOrganisms,
    createUserAccount,
    isAdmin,
    maisonMereAAPId,
  };
};
