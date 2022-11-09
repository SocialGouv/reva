import { ApolloClient, gql } from "@apollo/client";

const SEARCH_CERTIFICATIONS_FOR_DEPARTMENT = gql`
  query Certifications($query: UUID!) {
    getCertifications(departmentId: $query) {
      id
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
      query: SEARCH_CERTIFICATIONS_FOR_DEPARTMENT,
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
