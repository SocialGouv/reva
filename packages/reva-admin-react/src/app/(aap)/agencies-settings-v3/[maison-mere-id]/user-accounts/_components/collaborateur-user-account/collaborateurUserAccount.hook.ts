import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useSuspenseQuery } from "@tanstack/react-query";

const getCollaborateurOrganismsInfoQuery = graphql(`
  query getCollaborateurOrganismsInfoForUserAccountPage {
    account_getAccountForConnectedUser {
      id
      firstname
      lastname
      email
      organism {
        id
        modaliteAccompagnement
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