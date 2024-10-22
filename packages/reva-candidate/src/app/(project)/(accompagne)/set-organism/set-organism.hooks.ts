import { useQuery, useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { SearchOrganismFilter } from "@/graphql/generated/graphql";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const GET_ORGANISMS_FOR_CANDIDACY = graphql(`
  query getRandomOrganismsForCandidacy(
    $candidacyId: UUID!
    $searchText: String
    $searchFilter: SearchOrganismFilter
  ) {
    getRandomOrganismsForCandidacy(
      candidacyId: $candidacyId
      searchText: $searchText
      searchFilter: $searchFilter
    ) {
      rows {
        id
        label
        contactAdministrativeEmail
        contactAdministrativePhone
        website
        distanceKm
        isOnSite
        isRemote
        isMaisonMereMCFCompatible
        informationsCommerciales {
          nom
          telephone
          siteInternet
          emailContact
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
          conformeNormesAccessbilite
        }
      }
      totalRows
    }
  }
`);

const SELECT_ORGANISM_FOR_CANDIDACY = graphql(`
  mutation candidacy_selectOrganism($candidacyId: UUID!, $organismId: UUID!) {
    candidacy_selectOrganism(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
    }
  }
`);

export const useSetOrganism = ({
  candidacyId,
  searchText,
  searchFilter,
}: {
  candidacyId: string;
  searchText: string;
  searchFilter: SearchOrganismFilter;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const getRandomOrganismsForCandidacy = useQuery({
    queryKey: [
      "getRandomOrganismsForCandidacy",
      candidacyId,
      searchText,
      searchFilter,
    ],
    queryFn: () =>
      graphqlClient.request(GET_ORGANISMS_FOR_CANDIDACY, {
        candidacyId,
        searchText,
        searchFilter,
      }),
    gcTime: 0,
  });

  const selectOrganism = useMutation({
    mutationKey: ["candidacy_selectOrganism"],
    mutationFn: ({
      candidacyId,
      organismId,
    }: {
      candidacyId: string;
      organismId: string;
    }) =>
      graphqlClient.request(SELECT_ORGANISM_FOR_CANDIDACY, {
        candidacyId,
        organismId,
      }),
  });

  return {
    getRandomOrganismsForCandidacy,
    selectOrganism,
  };
};
