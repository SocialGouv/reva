import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
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
`;

export const getRandomOrganismsForCandidacy =
  (client: ApolloClient<object>) =>
  ({
    candidacyId,
    searchText,
    searchFilter,
  }: {
    candidacyId: string;
    searchText?: string;
    searchFilter: { distanceStatus?: string; pmr?: boolean; zip?: string };
  }) =>
    client.query({
      query: GET_ORGANISMS_FOR_CANDIDACY,
      variables: {
        candidacyId,
        searchText,
        searchFilter,
      },
      fetchPolicy: "no-cache",
    });

const SELECT_ORGANISM_FOR_CANDIDACY = gql`
  mutation candidacy_selectOrganism($candidacyId: UUID!, $organismId: UUID!) {
    candidacy_selectOrganism(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
    }
  }
`;

export const selectOrganismForCandidacy =
  (client: ApolloClient<object>) =>
  ({ candidacyId, organismId }: { candidacyId: string; organismId: string }) =>
    client.mutate({
      mutation: SELECT_ORGANISM_FOR_CANDIDACY,
      variables: { candidacyId, organismId },
    });
