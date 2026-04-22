import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const MaisonMereAAPQuery = graphql(`
  query getMaisonMereAAP($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      raisonSociale
      statutValidationInformationsJuridiquesMaisonMereAAP
      isActive
      isSignalized
      isMCFCompatible
      gestionnaire {
        id
      }
      organisms {
        modaliteAccompagnement
        nomPublic
        label
        id
        isVisibleInCandidateSearchResults
        remoteZones
      }
      comptesCollaborateurs {
        id
        email
        firstname
        lastname
        disabledAt
      }
    }
  }
`);

const updateMaisonMereOrganismsIsActiveMutation = graphql(`
  mutation updateMaisonMereOrganismsIsActive(
    $data: UpdateMaisonMereOrganismsIsActiveInput!
  ) {
    organism_updateMaisonMereOrganismsIsActive(data: $data)
  }
`);

const updateMaisonMereIsSignalizedMutation = graphql(`
  mutation updateMaisonMereIsSignalizedMutation(
    $data: UpdateMaisonMereIsSignalizedInput!
  ) {
    organism_updateMaisonMereIsSignalized(data: $data)
  }
`);

export const useMaisonMereAAP = (id: string) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { data: maisonMereAAPResponse, status: maisonMereAAPStatus } = useQuery(
    {
      queryKey: [id, "maisonMereAAP", "MaisonMereAapPage"],
      queryFn: () =>
        graphqlClient.request(MaisonMereAAPQuery, { maisonMereAAPId: id }),
      enabled: !!id,
    },
  );

  const { mutateAsync: updateOrganismIsActive } = useMutation({
    mutationFn: (params: { maisonMereAAPId: string; isActive: boolean }) =>
      graphqlClient.request(updateMaisonMereOrganismsIsActiveMutation, {
        data: {
          maisonMereAAPId: params.maisonMereAAPId,
          isActive: params.isActive,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id, "maisonMereAAP"] });
    },
  });

  const { mutateAsync: updateMaisonMereIsSignalized } = useMutation({
    mutationFn: (params: { maisonMereAAPId: string; isSignalized: boolean }) =>
      graphqlClient.request(updateMaisonMereIsSignalizedMutation, {
        data: {
          maisonMereAAPId: params.maisonMereAAPId,
          isSignalized: params.isSignalized,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id, "maisonMereAAP"] });
    },
  });

  const maisonMereAAP = maisonMereAAPResponse?.organism_getMaisonMereAAPById;

  const remoteOrganism = maisonMereAAP?.organisms?.find(
    (organism) => organism.modaliteAccompagnement === "A_DISTANCE",
  );

  const gestionnaireAccountId = maisonMereAAP?.gestionnaire.id;

  const comptesCollaborateurs = maisonMereAAP?.comptesCollaborateurs;

  return {
    maisonMereAAPResponse,
    maisonMereAAPStatus,
    maisonMereAAP,
    remoteOrganism,
    gestionnaireAccountId,
    comptesCollaborateurs,
    updateOrganismIsActive,
    updateMaisonMereIsSignalized,
    isAdmin,
  };
};
