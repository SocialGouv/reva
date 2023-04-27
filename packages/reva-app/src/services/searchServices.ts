import { ApolloClient, gql } from "@apollo/client";

const SEARCH_CERTIFICATIONS_FOR_DEPARTMENT = gql`
  query Certifications($departementId: UUID!, $searchText: String) {
    getCertifications(departmentId: $departementId, searchText: $searchText) {
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
  ({
    departementId,
    searchText,
  }: {
    departementId: string;
    searchText: string;
  }) =>
    client.query({
      query: SEARCH_CERTIFICATIONS_FOR_DEPARTMENT,
      variables: { departementId, searchText },
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
