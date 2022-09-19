import { ApolloClient, gql } from "@apollo/client";

import { Experience } from "../interface";

const CREATE_CANDIDACY_WITH_CERTIFICATION = gql`
  mutation create_candidacy(
    $deviceId: ID!
    $certificationId: ID!
    $regionId: ID!
  ) {
    candidacy_createCandidacy(
      candidacy: {
        deviceId: $deviceId
        certificationId: $certificationId
        regionId: $regionId
      }
    ) {
      id
      deviceId
      certificationId
      regionId
      createdAt
    }
  }
`;

export const createCandidacyWithCertification =
  (client: ApolloClient<object>) =>
  ({
    deviceId,
    certificationId,
    regionId,
  }: {
    deviceId: string;
    certificationId: string;
    regionId: string;
  }) =>
    client.mutate({
      mutation: CREATE_CANDIDACY_WITH_CERTIFICATION,
      variables: { deviceId, certificationId, regionId },
    });

const UPDATE_CERTIFICATION = gql`
  mutation candidacy_updateCertification(
    $deviceId: ID!
    $candidacyId: ID!
    $certificationId: ID!
    $regionId: ID!
  ) {
    candidacy_updateCertification(
      deviceId: $deviceId
      candidacyId: $candidacyId
      certificationId: $certificationId
      regionId: $regionId
    ) {
      id
    }
  }
`;

export const updateCertification =
  (client: ApolloClient<object>) =>
  ({
    deviceId,
    candidacyId,
    certificationId,
    regionId,
  }: {
    deviceId: string;
    candidacyId: string;
    certificationId: string;
    regionId: string;
  }) =>
    client.mutate({
      mutation: UPDATE_CERTIFICATION,
      variables: { deviceId, candidacyId, certificationId, regionId },
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

const ADD_EXPERIENCE = gql`
  mutation add_experience(
    $deviceId: ID!
    $candidacyId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_addExperience(
      candidacyId: $candidacyId
      deviceId: $deviceId
      experience: $experience
    ) {
      id
      title
      startedAt
      duration
      description
    }
  }
`;

export const addExperience =
  (client: ApolloClient<object>) =>
  async ({
    deviceId,
    candidacyId,
    experience,
  }: {
    deviceId: string;
    candidacyId: string;
    experience: Experience;
  }) => {
    const { data } = await client.mutate({
      mutation: ADD_EXPERIENCE,
      variables: { deviceId, candidacyId, experience },
    });

    const newExperience = data.candidacy_addExperience;

    return { ...newExperience, startedAt: new Date(newExperience.startedAt) };
  };

const UPDATE_EXPERIENCE = gql`
  mutation update_experience(
    $deviceId: ID!
    $candidacyId: ID!
    $experienceId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_updateExperience(
      candidacyId: $candidacyId
      deviceId: $deviceId
      experienceId: $experienceId
      experience: $experience
    ) {
      id
      title
      startedAt
      duration
      description
    }
  }
`;

export const updateExperience =
  (client: ApolloClient<object>) =>
  async ({
    deviceId,
    candidacyId,
    experienceId,
    experience,
  }: {
    deviceId: string;
    candidacyId: string;
    experienceId: string;
    experience: Experience;
  }) => {
    const { data } = await client.mutate({
      mutation: UPDATE_EXPERIENCE,
      variables: { deviceId, candidacyId, experienceId, experience },
    });

    const newExperience = data.candidacy_updateExperience;

    return { ...newExperience, startedAt: new Date(newExperience.startedAt) };
  };

const UPDATE_CONTACT = gql`
  mutation update_contact(
    $deviceId: ID!
    $candidacyId: ID!
    $phone: String
    $email: String
  ) {
    candidacy_updateContact(
      candidacyId: $candidacyId
      deviceId: $deviceId
      phone: $phone
      email: $email
    ) {
      id
      email
      phone
    }
  }
`;

export const updateContact =
  (client: ApolloClient<object>) =>
  async ({
    deviceId,
    candidacyId,
    phone,
    email,
  }: {
    deviceId: string;
    candidacyId: string;
    phone: null | string;
    email: null | string;
  }) => {
    const { data } = await client.mutate({
      mutation: UPDATE_CONTACT,
      variables: { deviceId, candidacyId, phone, email },
    });

    return data.candidacy_updateContact;
  };

const SUBMIT_CANDIDACY = gql`
  mutation submit_candidacy($deviceId: ID!, $candidacyId: ID!) {
    candidacy_submitCandidacy(candidacyId: $candidacyId, deviceId: $deviceId) {
      id
    }
  }
`;

export const submitCandidacy =
  (client: ApolloClient<object>) =>
  async ({
    deviceId,
    candidacyId,
  }: {
    deviceId: string;
    candidacyId: string;
  }) => {
    const { data } = await client.mutate({
      mutation: SUBMIT_CANDIDACY,
      variables: { deviceId, candidacyId },
    });

    return data.candidacy_submitCandidacy;
  };

const INITIALIZE_APP = gql`
  query getCandidacy($deviceId: ID!) {
    getCandidacy(deviceId: $deviceId) {
      id
      deviceId
      certificationId
      organism {
        id
        label
        address
        zip
        city
        contactAdministrativeEmail
      }
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
      candidacyStatuses {
        id
        status
      }
      regionId
      appointmentCount
      certificateSkills
      otherTraining
      individualHourCount
      collectiveHourCount
      additionalHourCount
      validatedByCandidate
    }

    getReferential {
      goals {
        id
        label
        order
      }
    }

    getRegions {
      id
      code
      label
    }
  }
`;

export const initializeApp =
  (client: ApolloClient<object>) =>
  async ({ deviceId }: { deviceId: string }) => {
    const { data, errors } = await client.query({
      query: INITIALIZE_APP,
      // we set the error policy at "all" to get referentials even if getCandidacy fail
      errorPolicy: "all",
      variables: {
        deviceId,
      },
    });

    let candidacy = null;
    if (data.getCandidacy) {
      const candidateGoals = data.getCandidacy.goals.map((g: any) => g.goalId);

      const goals = data.getReferential.goals.map((g: any) => ({
        ...g,
        checked: candidateGoals.includes(g.id),
      }));

      const experiences = data.getCandidacy.experiences.map((xp: any) => ({
        ...xp,
        startedAt: new Date(xp.startedAt),
      }));

      const {
        appointmentCount,
        certificateSkills,
        otherTraining,
        individualHourCount,
        collectiveHourCount,
        additionalHourCount,
        validatedByCandidate,
      } = data.getCandidacy;

      const training = {
        appointmentCount,
        certificateSkills,
        otherTraining,
        individualHourCount,
        collectiveHourCount,
        additionalHourCount,
        validatedByCandidate,
      };

      candidacy = {
        ...data.getCandidacy,
        createdAt: new Date(data.getCandidacy.createdAt),
        experiences,
        goals,
        regionId: data.getCandidacy.regionId,
        training
      };
    }

    return {
      candidacy,
      referentials: {
        goals: data.getReferential.goals,
      },
      regions: data.getRegions,
      graphQLErrors: errors,
    };
  };
