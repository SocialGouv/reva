import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getEtablissementQuery = graphql(`
  query getEtablissement($siret: ID!) {
    getEtablissementAsAdmin(siret: $siret) {
      siret
      siegeSocial
      raisonSociale
      formeJuridique {
        code
        libelle
        legalStatus
      }
      kbis {
        mandatairesSociaux {
          type
          nom
          fonction
        }
        formeJuridique
      }
      dateFermeture
      qualiopiStatus
    }
  }
`);

export const useEtablissement = (siret?: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { isLoading, isError, data, error, isFetching } = useQuery({
    // Clé nommée: la requête AAP `getEtablissement` porte sur le même SIRET mais
    // ne renvoie pas la même forme de données.
    queryKey: ["getEtablissementAsAdmin", siret],
    queryFn: () =>
      graphqlClient.request(getEtablissementQuery, { siret: siret! }),
    enabled: siret != undefined && siret?.length >= 14,
  });

  return {
    etablissement: data?.getEtablissementAsAdmin,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
