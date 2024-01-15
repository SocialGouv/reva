import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const legalInformationsQueries = graphql(`
  query getAccountOrganismAndLegalInformations {
    account_getAccountForConnectedUser {
      organism {
        maisonMereAAP {
          raisonSociale
          siret
          statutJuridique
          siteWeb
        }
        informationsCommerciales {
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
        }
      }
    }
  }
`);

export const useLegalInformationsPageQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: legalInformationsResponse,
    status: legalInformationsStatus,
    isError: legalInformationsIsError,
    isSuccess: legalInformationsIsSuccess,
  } = useQuery({
    queryKey: ["legalInformations"],
    queryFn: () => graphqlClient.request(legalInformationsQueries),
  });

  const informationsCommerciales =
    legalInformationsResponse?.account_getAccountForConnectedUser?.organism
      ?.informationsCommerciales;
  const maisonMereAAP =
    legalInformationsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;
  return {
    legalInformationsIsError,
    legalInformationsResponse,
    legalInformationsStatus,
    legalInformationsIsSuccess,
    maisonMereAAP,
    informationsCommerciales,
  };
};
