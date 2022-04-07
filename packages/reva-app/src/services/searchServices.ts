import { ApolloClient, gql } from "@apollo/client";

const SEARCH_CERTIFICATIONS_AND_PROFESSIONS = gql`
  query Certifications($query: String!) {
    searchCertificationsAndProfessions(query: $query) {
      certifications {
        id
        label
        summary
        codeRncp
      }
    }
  }
`;

export const searchCertifications =
  (client: ApolloClient<object>) =>
  ({ query }: { query: string }) =>
    client.query({
      query: SEARCH_CERTIFICATIONS_AND_PROFESSIONS,
      variables: { query },
    });

const GET_CERTIFICATE = gql`
  query Certification($id: ID!) {
    getCertification(id: $id) {
      id
      label
      summary
      codeRncp
      activities
      abilities
      activityArea
      accessibleJobType
    }
  }
`;

export const getCertification =
  (client: ApolloClient<object>) =>
  ({ id }: { id: string }) =>
    client.query({
      query: GET_CERTIFICATE,
      variables: { id },
    });
