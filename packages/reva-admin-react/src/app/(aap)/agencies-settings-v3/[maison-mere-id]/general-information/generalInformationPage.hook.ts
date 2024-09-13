import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const generalInformationQueries = graphql(`
  query getAccountMaisonMereGeneralInformation {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
        siret
        phone
        managerFirstname
        managerLastname
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

const getMaisonMereAAPGeneralInformationAdminQuery = graphql(`
  query getMaisonMereAAPGeneralInformationAdmin($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      siret
      phone
      managerFirstname
      managerLastname
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
`);

export const useGeneralInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { "maison-mere-id": maisonMereAAPId } = useParams();
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();

  const {
    data: generalInformationsResponse,
    status: generalInformationsStatus,
  } = useQuery({
    queryKey: ["maisonMereAAPGeneralInformation"],
    queryFn: () => graphqlClient.request(generalInformationQueries),
  });

  const {
    data: maisonMereAAPGeneralInformationResponse,
    status: maisonMereAAPGeneralInformationStatus,
  } = useQuery({
    queryKey: [maisonMereAAPId, "maisonMereAAP"],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPGeneralInformationAdminQuery, {
        maisonMereAAPId: maisonMereAAPId as string,
      }),
    enabled: isAdmin,
  });

  const maisonMereAAPSuccess =
    maisonMereAAPGeneralInformationStatus === "success" ||
    generalInformationsStatus === "success";
  const maisonMereAAPError =
    maisonMereAAPGeneralInformationStatus === "error" ||
    generalInformationsStatus === "error";

  let maisonMereAAP = null;
  if (isAdmin) {
    maisonMereAAP =
      maisonMereAAPGeneralInformationResponse?.organism_getMaisonMereAAPById;
  } else {
    maisonMereAAP =
      generalInformationsResponse?.account_getAccountForConnectedUser
        ?.maisonMereAAP;
  }

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
    maisonMereAAPSuccess,
    maisonMereAAPError,
    maisonMereAAP,
    etablissement,
    isGestionnaireMaisonMereAAP,
    isAdmin,
  };
};
