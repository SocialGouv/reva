import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismOnSitePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      label
      maisonMereAAP {
        raisonSociale
      }
      id
      nomPublic
      telephone
      siteInternet
      emailContact
      adresseNumeroEtNomDeRue
      conformeNormesAccessibilite
      adresseInformationsComplementaires
      adresseCodePostal
      adresseVille
      managedDegrees {
        id
        degree {
          id
          level
        }
      }
      formacodes {
        code
        label
      }
      conventionCollectives {
        id
        label
      }
      certifications {
        id
        codeRncp
        label
      }
    }
  }
`);

export const useOnSiteOrganism = () => {
  const { isAdmin } = useAuth();
  const { organismId, "maison-mere-id": maisonMereAAPId } = useParams<{
    organismId: string;
    "maison-mere-id": string;
  }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () => graphqlClient.request(getOrganismQuery, { organismId }),
    enabled: !!organismId,
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  const organismName = organism?.nomPublic || organism?.label;

  return { organism, organismId, organismName, maisonMereAAPId, isAdmin };
};
