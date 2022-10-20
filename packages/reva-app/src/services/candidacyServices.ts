import { ApolloClient, gql } from "@apollo/client";

import { Experience, candidacyStatus } from "../interface";

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

const ASK_FOR_LOGIN = gql`
  mutation candidate_askForLogin($email: String) {
    candidate_askForLogin(email: $email)
  }
`;

export const askForLogin =
  (client: ApolloClient<object>) => async (login: { email: string }) => {
    const { data } = await client.mutate({
      mutation: ASK_FOR_LOGIN,
      variables: login,
    });

    return data.candidate_askForLogin;
  };

const ASK_FOR_REGISTRATION = gql`
  mutation candidate_askForRegistration($candidate: CandidateInput!) {
    candidate_askForRegistration(candidate: $candidate)
  }
`;

export const askForRegistration =
  (client: ApolloClient<object>) =>
  async (candidate: {
    firstname: null | string;
    lastname: null | string;
    phone: null | string;
    email: null | string;
  }) => {
    const { data } = await client.mutate({
      mutation: ASK_FOR_REGISTRATION,
      variables: { candidate },
    });

    return data.candidate_askForRegistration;
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

const CANDIDACY_SELECTION = `
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
        status
        isActive
      }
      regionId
      appointmentCount
      certificateSkills
      otherTraining
      individualHourCount
      collectiveHourCount
      additionalHourCount
      validatedByCandidate
      basicSkills {
        label
      }
      mandatoryTrainings {
        label
      }`;

const CONFIRM_REGISTRATION = gql`
  mutation candidate_confirmRegistration($token: String!) {
    candidate: candidate_confirmRegistration(token: $token) {
      token
      candidacy {
        id
        ${CANDIDACY_SELECTION}
      }
    }
  }
`;

const GET_REFERENTIAL = gql`
  query getReferential {
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

export const confirmRegistration =
  (client: ApolloClient<object>) =>
  async ({ token }: { token: string }) => {
    const registrationMutation = client.mutate({
      mutation: CONFIRM_REGISTRATION,
      variables: { token },
    });

    const referentialQuery = client.query({
      query: GET_REFERENTIAL,
    });

    const [
      {
        data: { candidate },
      },
      {
        data: { getReferential, getRegions },
      },
    ] = await Promise.all([registrationMutation, referentialQuery]);

    return initializeApp({ candidate, getReferential, getRegions });
  };

function initializeApp({ candidate, getReferential, getRegions }: any) {
  let candidacy = candidate.candidacy;
  if (candidate.candidacy) {
    const candidateGoals = candidacy.goals.map((g: any) => g.goalId);

    const goals = getReferential.goals.map((g: any) => ({
      ...g,
      checked: candidateGoals.includes(g.id),
    }));

    const experiences = candidacy.experiences.map((xp: any) => ({
      ...xp,
      startedAt: new Date(xp.startedAt),
    }));

    const {
      additionalHourCount,
      appointmentCount,
      basicSkills,
      certificateSkills,
      collectiveHourCount,
      individualHourCount,
      mandatoryTrainings,
      otherTraining,
      validatedByCandidate,
    } = candidacy;

    const trainingProgram = {
      additionalHourCount,
      appointmentCount,
      basicSkills: basicSkills?.map((b: any) => b.label),
      certificateSkills,
      collectiveHourCount,
      individualHourCount,
      mandatoryTrainings: mandatoryTrainings?.map((m: any) => m.label),
      otherTraining,
      validatedByCandidate,
    };

    candidacy = {
      ...candidacy,
      candidacyStatus: candidacy.candidacyStatuses?.find(
        (s: { isActive: string; status: candidacyStatus }) => s.isActive
      ).status,
      createdAt: new Date(candidacy.createdAt),
      experiences,
      goals,
      regionId: candidacy.regionId,
      trainingProgram,
    };
  }

  return {
    candidacy,
    referentials: {
      goals: getReferential.goals,
    },
    regions: getRegions,
  };
}

const CONFIRM_TRAINING_FORM = gql`
  mutation candidacy_confirmTrainingForm($candidacyId: UUID!) {
    candidacy_confirmTrainingForm(candidacyId: $candidacyId) {
      id
      createdAt
    }
  }
`;

export const confirmTrainingForm =
  (client: ApolloClient<object>) =>
  ({ candidacyId }: { candidacyId: string }) =>
    client.mutate({
      mutation: CONFIRM_TRAINING_FORM,
      variables: { candidacyId },
    });
