import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
  query getOrganismsForCandidacy($query: UUID!) {
    getOrganismsForCandidacy(candidacyId: $query) {
      id
      label
      address
      zip
      city
      contactAdministrativeEmail
    }
  }
`;

export const getOrganismsForCandidacy =
  (client: ApolloClient<object>) =>
  ({ query }: { query: string }) =>
    client.query({
      query: GET_ORGANISMS_FOR_CANDIDACY,
      variables: { query },
      fetchPolicy: "no-cache",
    });

const SELECT_ORGANISM_FOR_CANDIDACY = gql`
  mutation candidacy_selectOrganism($candidacyId: UUID!, $organismId: UUID!) {
    candidacy_selectOrganism(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
      organismId
      departmentId
      createdAt
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
