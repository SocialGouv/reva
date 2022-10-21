import { ApolloClient, gql } from "@apollo/client";

import { Experience, candidacyStatus } from "../interface";

const CREATE_CANDIDACY_WITH_CERTIFICATION = gql`
  mutation create_candidacy($certificationId: ID!, $regionId: ID!) {
    candidacy_createCandidacy(
      candidacy: { certificationId: $certificationId, regionId: $regionId }
    ) {
      id
      certificationId
      regionId
      createdAt
    }
  }
`;

export const createCandidacyWithCertification =
  (client: ApolloClient<object>) =>
  ({
    certificationId,
    regionId,
  }: {
    certificationId: string;
    regionId: string;
  }) =>
    client.mutate({
      mutation: CREATE_CANDIDACY_WITH_CERTIFICATION,
      variables: { certificationId, regionId },
    });

const UPDATE_CERTIFICATION = gql`
  mutation candidacy_updateCertification(
    $candidacyId: ID!
    $certificationId: ID!
    $regionId: ID!
  ) {
    candidacy_updateCertification(
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
    candidacyId,
    certificationId,
    regionId,
  }: {
    candidacyId: string;
    certificationId: string;
    regionId: string;
  }) =>
    client.mutate({
      mutation: UPDATE_CERTIFICATION,
      variables: { candidacyId, certificationId, regionId },
    });

const SAVE_GOALS = gql`
  mutation update_goals($candidacyId: ID!, $goals: [CandidateGoalInput!]!) {
    candidacy_updateGoals(candidacyId: $candidacyId, goals: $goals)
  }
`;

export const saveGoals =
  (client: ApolloClient<object>) =>
  async ({
    candidacyId,
    goals,
  }: {
    candidacyId: string;
    goals: { goalId: string }[];
  }) =>
    client.mutate({
      mutation: SAVE_GOALS,
      variables: { candidacyId, goals },
    });

const ADD_EXPERIENCE = gql`
  mutation add_experience($candidacyId: ID!, $experience: ExperienceInput) {
    candidacy_addExperience(
      candidacyId: $candidacyId
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
    candidacyId,
    experience,
  }: {
    candidacyId: string;
    experience: Experience;
  }) => {
    const { data } = await client.mutate({
      mutation: ADD_EXPERIENCE,
      variables: { candidacyId, experience },
    });

    const newExperience = data.candidacy_addExperience;

    return { ...newExperience, startedAt: new Date(newExperience.startedAt) };
  };

const UPDATE_EXPERIENCE = gql`
  mutation update_experience(
    $candidacyId: ID!
    $experienceId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_updateExperience(
      candidacyId: $candidacyId
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
    candidacyId,
    experienceId,
    experience,
  }: {
    candidacyId: string;
    experienceId: string;
    experience: Experience;
  }) => {
    const { data } = await client.mutate({
      mutation: UPDATE_EXPERIENCE,
      variables: { candidacyId, experienceId, experience },
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
  mutation update_contact($candidacyId: ID!, $phone: String, $email: String) {
    candidacy_updateContact(
      candidacyId: $candidacyId
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
    candidacyId,
    phone,
    email,
  }: {
    candidacyId: string;
    phone: null | string;
    email: null | string;
  }) => {
    const { data } = await client.mutate({
      mutation: UPDATE_CONTACT,
      variables: { candidacyId, phone, email },
    });

    return data.candidacy_updateContact;
  };

const SUBMIT_CANDIDACY = gql`
  mutation submit_candidacy($candidacyId: ID!) {
    candidacy_submitCandidacy(candidacyId: $candidacyId) {
      id
    }
  }
`;

export const submitCandidacy =
  (client: ApolloClient<object>) =>
  async ({ candidacyId }: { candidacyId: string }) => {
    const { data } = await client.mutate({
      mutation: SUBMIT_CANDIDACY,
      variables: { candidacyId },
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
    candidateLogged: candidate_confirmRegistration(token: $token) {
      token
      candidate {
        id
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
        data: { candidateLogged },
      },
      {
        data: { getReferential, getRegions },
      },
    ] = await Promise.all([registrationMutation, referentialQuery]);

    return initializeApp({ candidateLogged, getReferential, getRegions });
  };

function initializeApp({ candidateLogged, getReferential, getRegions }: any) {
  let candidacy = candidateLogged.candidate?.candidacy;
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
      ...candidateLogged.candidate,
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
