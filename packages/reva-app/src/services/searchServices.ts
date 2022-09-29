import { ApolloClient, gql } from "@apollo/client";

const SEARCH_CERTIFICATIONS_FOR_REGION = gql`
  query Certifications($query: UUID!) {
    getCertifications(regionId: $query) {
      id
      acronym
      label
      summary
      codeRncp
      status
    }
  }
`;

export const searchCertifications =
  (client: ApolloClient<object>) =>
  ({ query }: { query: string }) =>
    client.query({
      query: SEARCH_CERTIFICATIONS_FOR_REGION,
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
      status
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
