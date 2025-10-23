import { useSuspenseQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCollaborateurOrganismsInfoQuery = graphql(`
  query getCollaborateurOrganismsInfoForUserAccountPage {
    account_getAccountForConnectedUser {
      id
      firstname
      lastname
      email
      organisms {
        id
        modaliteAccompagnement
        label
        nomPublic
      }
      maisonMereAAP {
        id
      }
    }
  }
`);

export const useUpdateUserAccountPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: collaborateurOrganismsInfo,
    status: collaborateurOrganismsInfoStatus,
  } = useSuspenseQuery({
    queryKey: ["organisms", "updateUserAccount"],
    queryFn: () => graphqlClient.request(getCollaborateurOrganismsInfoQuery),
  });

  const userAccount =
    collaborateurOrganismsInfo?.account_getAccountForConnectedUser;

  return {
    userAccount,
    collaborateurOrganismsInfoStatus,
  };
};
