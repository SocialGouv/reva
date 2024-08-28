import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const generalInformationQueries = graphql(`
  query getAccountMaisonMereGeneralInformation {
    account_getAccountForConnectedUser {
      organism {
        maisonMereAAP {
          id
          siret
          phone
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

const getEtablissementQuery = graphql(`
  query getEtablissementForAgenciesSettings($siret: ID!) {
    getEtablissement(siret: $siret) {
      siret
      raisonSociale
      formeJuridique {
        code
        libelle
        legalStatus
      }
      siegeSocial
      dateFermeture
      qualiopiStatus
    }
  }
`);

export const useGeneralInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: generalInformationsResponse,
    status: generalInformationsStatus,
  } = useQuery({
    queryKey: ["maisonMereAAPGeneralInformation"],
    queryFn: () => graphqlClient.request(generalInformationQueries),
  });

  const maisonMereAAP =
    generalInformationsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;

  const { data: getEtablissementData } = useQuery({
    queryKey: [maisonMereAAP?.siret],
    queryFn: () =>
      graphqlClient.request(getEtablissementQuery, {
        siret: maisonMereAAP?.siret || "",
      }),
    enabled: !!maisonMereAAP?.siret && maisonMereAAP?.siret?.length >= 14,
  });

  const etablissement = getEtablissementData?.getEtablissement;
  return {
    generalInformationsResponse,
    generalInformationsStatus,
    maisonMereAAP,
    etablissement,
  };
};
