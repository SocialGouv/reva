import { ApolloClient, gql } from "@apollo/client";

import { Experience, candidacyStatus } from "../interface";

const UPDATE_CERTIFICATION = gql`
  mutation candidacy_updateCertification(
    $deviceId: ID!
    $candidacyId: ID!
    $certificationId: ID!
    $departmentId: ID!
  ) {
    candidacy_updateCertification(
      deviceId: $deviceId
      candidacyId: $candidacyId
      certificationId: $certificationId
      departmentId: $departmentId
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
    departmentId,
  }: {
    deviceId: string;
    candidacyId: string;
    certificationId: string;
    departmentId: string;
  }) =>
    client.mutate({
      mutation: UPDATE_CERTIFICATION,
      variables: { deviceId, candidacyId, certificationId, departmentId },
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
  mutation candidate_askForLogin($email: String!) {
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
      id
      organism {
        id
        label
        address
        zip
        city
        contactAdministrativeEmail
      }
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
  mutation candidate_login($token: String!) {
    candidateLogged: candidate_login(token: $token) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
      candidate {
        firstname
        lastname
        email
        phone
        candidacy { ${CANDIDACY_SELECTION} }
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

    getDepartments {
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
        data: { candidateLogged },
      },
      {
        data: { getReferential, getDepartments },
      },
    ] = await Promise.all([registrationMutation, referentialQuery]);

    return initializeApp({ candidateLogged, getReferential, getDepartments });
  };

const GET_CANDIDATE_WITH_CANDIDACY = gql`
  query candidate_getCandidateWithCandidacy {
    candidate: candidate_getCandidateWithCandidacy {
      firstname
      lastname
      email
      phone
      candidacy { ${CANDIDACY_SELECTION} }

    }

    getReferential {
      goals {
        id
        label
        order
      }
    }

    getDepartments {
      id
      code
      label
    }
  }
`;

export const getCandidateWithCandidacy =
  (client: ApolloClient<object>) => async (params: { token: string }) => {
    const { data } = await client.query({
      context: {
        headers: {
          authorization: `Bearer ${params.token}`,
        },
      },
      query: GET_CANDIDATE_WITH_CANDIDACY,
    });

    return {
      candidacy: formatCandidacy(data.candidate, data.getReferential),
      referentials: {
        goals: data.getReferential.goals,
      },
      departments: data.getDepartments,
    };
  };

function initializeApp({
  candidateLogged,
  getReferential,
  getDepartments,
}: any) {
  return {
    tokens: candidateLogged.tokens,
    candidacy: formatCandidacy(candidateLogged.candidate, getReferential),
    referentials: {
      goals: getReferential.goals,
    },
    departments: getDepartments,
  };
}

function formatCandidacy(candidate: any, getReferential: any) {
  let candidacy = candidate?.candidacy;
  if (candidacy) {
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
      ...candidate,
      ...candidacy,
      candidacyStatus: candidacy.candidacyStatuses?.find(
        (s: { isActive: string; status: candidacyStatus }) => s.isActive
      ).status,
      createdAt: new Date(candidacy.createdAt),
      experiences,
      goals,
      trainingProgram,
    };
  }

  return candidacy;
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
