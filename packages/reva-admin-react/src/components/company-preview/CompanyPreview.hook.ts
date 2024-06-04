import { useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const getEtablissementQuery = graphql(`
  query getEtablissement($siret: ID!) {
    getEtablissement(siret: $siret) {
      siret
      siegeSocial
      raisonSociale
      formeJuridique {
        code
        libelle
        legalStatus
      }
      dateFermeture
      qualiopiStatus
    }
  }
`);

export const useEtablissement = (siret?: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { isLoading, isError, data, error, isFetching } = useQuery({
    queryKey: [siret],
    queryFn: () =>
      graphqlClient.request(getEtablissementQuery, { siret: siret! }),
    enabled: siret != undefined && siret?.length >= 14,
  });

  return {
    etablissement: data?.getEtablissement,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
