import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const GestionnaireMaisonMerAAPOrganismInfoQuery = graphql(`
  query getGestionnaireMaisonMerAAPOrganismInfoQuery {
    account_getAccountForConnectedUser {
      organism {
        contactAdministrativeEmail
        contactAdministrativePhone
      }
    }
  }
`);

export const useOrganismInformationForm = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: organismData } = useQuery({
    queryKey: ["organism"],
    queryFn: () =>
      graphqlClient.request(GestionnaireMaisonMerAAPOrganismInfoQuery),
  });

  const gestionnaireMaisonMerAAPOrganismPhone =
    organismData?.account_getAccountForConnectedUser?.organism
      ?.contactAdministrativePhone;
  const gestionnaireMaisonMerAAPOrganismEmail =
    organismData?.account_getAccountForConnectedUser?.organism
      ?.contactAdministrativeEmail;

  return {
    gestionnaireMaisonMerAAPOrganismPhone,
    gestionnaireMaisonMerAAPOrganismEmail,
  };
};
