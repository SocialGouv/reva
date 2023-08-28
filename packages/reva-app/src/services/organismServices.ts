import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
  query getRandomOrganismsForCandidacy(
    $candidacyId: UUID!
    $departmentId: UUID!
    $searchText: String
  ) {
    getRandomOrganismsForCandidacy(
      candidacyId: $candidacyId
      searchText: $searchText
    ) {
      id
      label
      contactAdministrativeEmail
      contactAdministrativePhone
      website
      organismOnDepartments(departmentId: $departmentId) {
        id
        isRemote
        isOnSite
      }
    }
  }
`;

export const getRandomOrganismsForCandidacy =
  (client: ApolloClient<object>) =>
  ({
    candidacyId,
    departmentId,
    searchText,
  }: {
    candidacyId: string;
    departmentId: string;
    searchText?: string;
  }) =>
    client.query({
      query: GET_ORGANISMS_FOR_CANDIDACY,
      variables: { candidacyId, departmentId, searchText },
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
