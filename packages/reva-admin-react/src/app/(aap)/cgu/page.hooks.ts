import { useQuery, useMutation } from "@tanstack/react-query";
import request from "graphql-request";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getMaisonMereCGUQuery = graphql(`
  query getMaisonMereCGUQuery {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
        cgu {
          version
          acceptedAt
          isLatestVersion
        }
      }
    }
  }
`);

const acceptMaisonMereCGUMutation = graphql(`
  mutation acceptMaisonMereCGUMutation {
    organism_acceptCgu
  }
`);

const getCguQuery = graphql(`
  query getCgu {
    legals(filters: { nom: { eq: "CGU" } }) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

export const useAppCgu = () => {
  const { graphqlClient } = useGraphQlClient();

  const getMaisonMereCGU = useQuery({
    queryKey: ["getMaisonMereCGUQuery"],
    queryFn: () => graphqlClient.request(getMaisonMereCGUQuery),
  });

  const getCguResponse = useQuery({
    queryKey: ["getCguFromStrapi"],
    queryFn: () =>
      request(
        (process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL ?? "") + "/graphql",
        getCguQuery,
      ),
  });

  const cguResponse = getCguResponse?.data?.legals[0];

  const acceptMaisonMereCgu = useMutation({
    mutationFn: () => graphqlClient.request(acceptMaisonMereCGUMutation),
  });

  return {
    getMaisonMereCGU,
    acceptMaisonMereCgu,
    cguResponse,
  };
};
