import { ApolloClient, gql } from "@apollo/client";

const CREATE_CANDIDACY_WITH_CERTIFICATION = gql`
  mutation create_candidacy($deviceId: ID!, $certificationId: ID!) {
    candidacy_createCandidacy(
      candidacy: { deviceId: $deviceId, certificationId: $certificationId }
    ) {
      deviceId
      certificationId
      createdAt
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

const GET_CANDIDACY = gql`
  query getCandidacy($deviceId: ID!) {
    getCandidacy(deviceId: $deviceId) {
      id
      deviceId
      certificationId
      companionId
      email
      phone
      createdAt
      certification {
        id
        codeRncp
        label
        summary
      }
      experiences {
        id
        title
        startedAt
        duration
        description
      }
      goals {
        goalId
        additionalInformation
      }
    }
  }
`;

export const getCandidacy =
  (client: ApolloClient<object>) =>
  async ({ deviceId }: { deviceId: string }) => {
    const { data } = await client.query({
      query: GET_CANDIDACY,
      variables: {
        deviceId,
      },
    });

    const experiences = data.getCandidacy.experiences.map((xp: any) => ({
      ...xp,
      startedAt: new Date(xp.startedAt),
    }));
    return {
      ...data.getCandidacy,
      createdAt: new Date(data.getCandidacy.createdAt),
      experiences,
    };
  };
