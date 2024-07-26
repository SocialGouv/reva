"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismLayout($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      isOnSite
      isRemote
      fermePourAbsenceOuConges
      managedDegrees {
        id
      }
      domaines {
        id
      }
      conventionCollectives {
        id
      }
    }
  }
`);

const OrganismDetailsLayout = ({ children }: { children: ReactNode }) => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();
  const { isGestionnaireMaisonMereAAP } = useAuth();

  const { data: getOrganismResponse, status: getOrganismStatus } = useQuery({
    queryKey: [
      organismId,
      "organisms",
      "agencies-settings-aap-organism-layout",
    ],
    queryFn: () => graphqlClient.request(getOrganismQuery, { organismId }),
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  if (!organism) {
    return null;
  }

  const {
    isOnSite,
    isRemote,
    fermePourAbsenceOuConges,
    managedDegrees,
    domaines,
    conventionCollectives,
  } = organism;

  const isVisibleInSearchResults =
    (isOnSite || isRemote) &&
    !fermePourAbsenceOuConges &&
    managedDegrees.length &&
    (domaines.length || conventionCollectives.length);

  return (
    <div className="flex flex-col">
      {isGestionnaireMaisonMereAAP && !isVisibleInSearchResults && (
        <Badge severity="warning" className="mb-4">
          Actuellement, vous n’êtes pas visible dans les résultats de recherche.
        </Badge>
      )}
      {children}
    </div>
  );
};

export default OrganismDetailsLayout;
