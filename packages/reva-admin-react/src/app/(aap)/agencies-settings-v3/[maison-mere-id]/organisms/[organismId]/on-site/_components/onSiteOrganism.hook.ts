import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismOnSitePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      label
      maisonMereAAP {
        raisonSociale
      }
      informationsCommerciales {
        id
        nom
        telephone
        siteInternet
        emailContact
        adresseNumeroEtNomDeRue
        conformeNormesAccessbilite
        adresseInformationsComplementaires
        adresseCodePostal
        adresseVille
      }
      managedDegrees {
        id
        degree {
          id
          label
        }
      }
      domaines {
        id
        label
      }
      formacodes {
        code
        label
      }
      conventionCollectives {
        id
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

  const organismName =
    organism?.informationsCommerciales?.nom || organism?.label;

  return { organism, organismId, organismName, maisonMereAAPId, isAdmin };
};
