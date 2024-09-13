import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const MaisonMereAAPQuery = graphql(`
  query getMaisonMereAAP($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      raisonSociale
      statutValidationInformationsJuridiquesMaisonMereAAP
      organisms {
        isHeadAgency
        isActive
        accounts {
          id
        }
        informationsCommerciales {
          nom
        }
        label
        id
        isRemote
        isOnSite
        isVisibleInCandidateSearchResults
        remoteZones
        accounts {
          id
          email
          firstname
          lastname
        }
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

export const useMaisonMereAAP = (id: string) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { data: maisonMereAAPResponse, status: maisonMereAAPStatus } = useQuery(
    {
      queryKey: [id, "maisonMereAAP"],
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

  const maisonMereAAP = maisonMereAAPResponse?.organism_getMaisonMereAAPById;

  const headAgencyOrganism = maisonMereAAP?.organisms?.find(
    (organism) => organism.isHeadAgency,
  );

  const accountId = headAgencyOrganism?.accounts[0]?.id;

  return {
    maisonMereAAPResponse,
    maisonMereAAPStatus,
    maisonMereAAP,
    headAgencyOrganism,
    accountId,
    updateOrganismIsActive,
  };
};
