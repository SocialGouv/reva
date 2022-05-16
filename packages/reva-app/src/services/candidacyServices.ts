import { ApolloClient, gql } from "@apollo/client";

const CREATE_CANDIDACY_WITH_CERTIFICATION = gql`
  mutation create_candidacy($deviceId: ID!, $certificationId: ID!) {
    candidacy_createCandidacy(
      candidacy: { deviceId: $deviceId, certificationId: $certificationId }
    ) {
      deviceId
      certificationId
    }
  }
`;

export const createCandidacyWithCertification =
  (client: ApolloClient<object>) =>
  ({
    deviceId,
    certificationId,
  }: {
    deviceId: string;
    certificationId: string;
  }) =>
    client.mutate({
      mutation: CREATE_CANDIDACY_WITH_CERTIFICATION,
      variables: { deviceId, certificationId },
    });
