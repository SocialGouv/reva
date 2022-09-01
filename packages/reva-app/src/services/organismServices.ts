import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
  query getOrganismsForCandidacy($query: UUID!) {
    getOrganismsForCandidacy(candidacyId: $query) {
      id
      label
      adress
      cp
      city
      contactAdministratif
    }
  }
`;

export const getOrganismsForCandidacy =
  (client: ApolloClient<object>) =>
  ({ query }: { query: string }) =>
    client.query({
      query: GET_ORGANISMS_FOR_CANDIDACY,
      variables: { query },
    });

const SET_ORGANISMS_FOR_CANDIDACY = gql`
  mutation setOrganismsForCandidacy($candidacyId: UUID!, $organismId: UUID!) {
    candidacy_selectOrganism(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
      candidacyId
      organismId
      regionId
      createdAt
    }
  }
`;

export const setOrganismsForCandidacy =
  (client: ApolloClient<object>) =>
  ({ candidacyId, organismId }: { candidacyId: string; organismId: string }) =>
    client.mutate({
      mutation: SET_ORGANISMS_FOR_CANDIDACY,
      variables: { candidacyId, organismId },
    });
