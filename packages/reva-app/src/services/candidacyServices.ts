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
const SAVE_GOALS = gql`
  mutation update_goals(
    $deviceId: ID!
    $candidacyId: ID!
    $goals: [CandidateGoalInput!]!
  ) {
    candidacy_updateGoals(
      deviceId: $deviceId
      candidacyId: $candidacyId
      goals: $goals
    )
  }
`;

export const saveGoals =
  (client: ApolloClient<object>) =>
  async ({
    deviceId,
    candidacyId,
    goals,
  }: {
    deviceId: string;
    candidacyId: string;
    goals: { goalId: string }[];
  }) =>
    client.mutate({
      mutation: SAVE_GOALS,
      variables: { deviceId, candidacyId, goals },
    });

const SAVE_GOALS = gql`
  mutation update_goals(
    $deviceId: ID!
    $candidacyId: ID!
    $goals: [CandidateGoalInput!]!
  ) {
    candidacy_updateGoals(
      deviceId: $deviceId
      candidacyId: $candidacyId
      goals: $goals
    )
  }
`;

export const saveGoals =
  (client: ApolloClient<object>) =>
  async ({
    deviceId,
    candidacyId,
    goals,
  }: {
    deviceId: string;
    candidacyId: string;
    goals: { goalId: string }[];
  }) =>
    client.mutate({
      mutation: SAVE_GOALS,
      variables: { deviceId, candidacyId, goals },
    });

const INITIALIZE_APP = gql`
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

    getReferential {
      goals {
        id
        label
        order
      }
    }
  }
`;

export const initializeApp =
  (client: ApolloClient<object>) =>
  async ({ deviceId }: { deviceId: string }) => {
    const { data } = await client.query({
      query: INITIALIZE_APP,
      variables: {
        deviceId,
      },
    });

    const candidateGoals = data.getCandidacy.goals.map((g: any) => g.goalId);

    const goals = data.getReferential.goals.map((g: any) => ({
      ...g,
      checked: candidateGoals.includes(g.id),
    }));

    const experiences = data.getCandidacy.experiences.map((xp: any) => ({
      ...xp,
      startedAt: new Date(xp.startedAt),
    }));
    return {
      candidacy: {
        ...data.getCandidacy,
        createdAt: new Date(data.getCandidacy.createdAt),
        experiences,
        goals,
      },
    };
  };
