import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
  query getRandomOrganismsForCandidacy(
    $candidacyId: UUID!
    $departmentId: UUID!
    $searchText: String
    $searchFilter: SearchOrganismFilter
    $searchZipOrCity: String
  ) {
    getRandomOrganismsForCandidacy(
      candidacyId: $candidacyId
      searchText: $searchText
      searchFilter: $searchFilter
      searchZipOrCity: $searchZipOrCity
    ) {
      rows {
        id
        label
        contactAdministrativeEmail
        contactAdministrativePhone
        website
        organismOnDepartments(departmentId: $departmentId) {
          id
          departmentId
          isRemote
          isOnSite
        }
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
    departmentId,
    searchText,
    searchFilter,
    searchZipOrCity,
  }: {
    candidacyId: string;
    departmentId: string;
    searchText?: string;
    searchFilter: { distanceStatus?: string };
    searchZipOrCity?: string;
  }) =>
    client.query({
      query: GET_ORGANISMS_FOR_CANDIDACY,
      variables: {
        candidacyId,
        departmentId,
        searchText,
        searchFilter,
        searchZipOrCity,
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
