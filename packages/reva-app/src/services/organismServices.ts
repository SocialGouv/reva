import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
  query getRandomOrganismsForCandidacy(
    $candidacyId: UUID!
    $searchText: String
  ) {
    getRandomOrganismsForCandidacy(
      candidacyId: $candidacyId
      searchText: $searchText
    ) {
      id
      label
      contactAdministrativeEmail
    }
  }
`;

export const getRandomOrganismsForCandidacy =
  (client: ApolloClient<object>) =>
  ({ candidacyId, searchText }: { candidacyId: string; searchText?: string }) =>
    client.query({
      query: GET_ORGANISMS_FOR_CANDIDACY,
      variables: { candidacyId, searchText },
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
