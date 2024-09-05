import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismOnSitePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      label
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
      conventionCollectives {
        id
        label
      }
    }
  }
`);

export const useOnSiteOrganism = () => {
  const { organismId } = useParams<{ organismId: string }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () => graphqlClient.request(getOrganismQuery, { organismId }),
    enabled: !!organismId,
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  const organismName =
    organism?.informationsCommerciales?.nom || organism?.label;

  return { organism, organismId, organismName };
};
