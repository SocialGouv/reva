import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import { SearchOrganismFilter } from "@/graphql/generated/graphql";

const GET_CANDIDATE_WITH_CANDIDACY_FOR_SET_ORGANISM = graphql(`
  query getCandidateWithCandidacyForSetOrganism {
    candidate_getCandidateWithCandidacy {
      candidacy {
        id
        status
        typeAccompagnement
        candidacyDropOut {
          createdAt
        }
        organism {
          id
        }
      }
    }
  }
`);

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
        modaliteAccompagnement
        website
        distanceKm
        isMaisonMereMCFCompatible
        nomPublic
        telephone
        siteInternet
        emailContact
        adresseNumeroEtNomDeRue
        adresseInformationsComplementaires
        adresseCodePostal
        adresseVille
        conformeNormesAccessibilite
        fermePourAbsenceOuConges
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
  searchText,
  searchFilter,
}: {
  searchText: string;
  searchFilter: SearchOrganismFilter;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidateWithCandidacy } = useQuery({
    queryKey: ["candidate", "set-organism"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY_FOR_SET_ORGANISM),
  });
  const candidate =
    getCandidateWithCandidacy?.candidate_getCandidateWithCandidacy;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidate?.candidacy?.status,
    typeAccompagnement: candidate?.candidacy?.typeAccompagnement,
    candidacyDropOut: !!candidate?.candidacy?.candidacyDropOut,
  });

  const getRandomOrganismsForCandidacy = useQuery({
    queryKey: [
      "getRandomOrganismsForCandidacy",
      candidate?.candidacy?.id,
      searchText,
      searchFilter,
    ],
    queryFn: () =>
      graphqlClient.request(GET_ORGANISMS_FOR_CANDIDACY, {
        candidacyId: candidate?.candidacy?.id,
        searchText,
        searchFilter,
      }),
    gcTime: 0,
    enabled: !!candidate?.candidacy?.id,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate"] }),
  });

  return {
    getRandomOrganismsForCandidacy,
    selectOrganism,
    canEditCandidacy,
    candidate,
  };
};
