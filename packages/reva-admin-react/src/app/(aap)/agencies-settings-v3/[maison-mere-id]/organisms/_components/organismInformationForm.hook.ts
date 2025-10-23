import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GestionnaireMaisonMerAAPOrganismInfoQuery = graphql(`
  query getGestionnaireMaisonMerAAPOrganismInfoQuery {
    account_getAccountForConnectedUser {
      organisms {
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

  //Un gestionnaire de maison mère AAP n'est sensé être rattaché qu'à un seul organisme,
  // la partie remote de sa maison mère
  const organism =
    organismData?.account_getAccountForConnectedUser?.organisms?.[0];

  const gestionnaireMaisonMerAAPOrganismPhone =
    organism?.contactAdministrativePhone;
  const gestionnaireMaisonMerAAPOrganismEmail =
    organism?.contactAdministrativeEmail;

  return {
    gestionnaireMaisonMerAAPOrganismPhone,
    gestionnaireMaisonMerAAPOrganismEmail,
  };
};
