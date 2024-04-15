import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const legalInformationQueries = graphql(`
  query getAccountMaisonMereLegalInformation {
    account_getAccountForConnectedUser {
      organism {
        maisonMereAAP {
          raisonSociale
          siret
          statutJuridique
          siteWeb
          adresse
          ville
          codePostal
        }
      }
    }
  }
`);

export const useLegalInformationsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: legalInformationsResponse, status: legalInformationsStatus } =
    useQuery({
      queryKey: ["legalInformations"],
      queryFn: () => graphqlClient.request(legalInformationQueries),
    });

  const maisonMereAAP =
    legalInformationsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;
  return {
    legalInformationsResponse,
    legalInformationsStatus,
    maisonMereAAP,
  };
};
