import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const legalInformationQueries = graphql(`
  query getAccountMaisonMereLegalInformation {
    account_getAccountForConnectedUser {
      organism {
        maisonMereAAP {
          id
          raisonSociale
          siret
          statutJuridique
          siteWeb
          statutValidationInformationsJuridiquesMaisonMereAAP
          legalInformationDocumentsDecisions(
            input: { decision: DEMANDE_DE_PRECISION }
          ) {
            id
            aapComment
            decisionTakenAt
          }
          gestionnaire {
            firstname
            lastname
            email
          }
        }
      }
    }
  }
`);

export const useLegalInformationsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: legalInformationsResponse, status: legalInformationsStatus } =
    useQuery({
      queryKey: ["maisonMereAAPLegalInformation"],
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
