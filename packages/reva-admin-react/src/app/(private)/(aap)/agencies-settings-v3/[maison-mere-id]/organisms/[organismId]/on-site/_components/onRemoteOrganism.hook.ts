import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismRemotePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      maisonMereAAP {
        id
        raisonSociale
      }
      id
      label
      nomPublic
      telephone
      siteInternet
      emailContact
      remoteZones
      modaliteAccompagnementRenseigneeEtValide
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

export const useOnRemoteOrganism = () => {
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

  return {
    organism,
    organismId,
    organismName,
    maisonMereAAPId,
    isAdmin,
  };
};
