import { ApolloClient, gql } from "@apollo/client";

const GET_ORGANISMS_FOR_CANDIDACY = gql`
  query OrganismsForCandidacy($query: UUID!) {
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
