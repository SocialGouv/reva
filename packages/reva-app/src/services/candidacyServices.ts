import { ApolloClient, gql } from "@apollo/client";

import { Experience, candidacyStatus } from "../interface";

const UPDATE_CERTIFICATION = gql`
  mutation candidacy_updateCertification(
    $candidacyId: ID!
    $certificationId: ID!
    $departmentId: ID!
  ) {
    candidacy_updateCertification(
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
    candidacyId,
    certificationId,
    departmentId,
  }: {
    candidacyId: string;
    certificationId: string;
    departmentId: string;
  }) =>
    client.mutate({
      mutation: UPDATE_CERTIFICATION,
      variables: { candidacyId, certificationId, departmentId },
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
    goals: { id: string }[];
  }) =>
    client.mutate({
      mutation: SAVE_GOALS,
      variables: {
        candidacyId,
        goals: goals.map((g) => ({ goalId: g.id })),
      },
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
  async ({
    firstname,
    lastname,
    phone,
    email,
    departmentId,
  }: {
    firstname: null | string;
    lastname: null | string;
    phone: null | string;
    email: null | string;
    departmentId: null | string;
  }) => {
    const { data } = await client.mutate({
      mutation: ASK_FOR_REGISTRATION,
      variables: {
        candidate: {
          firstname,
          lastname,
          phone,
          email,
          departmentId,
        },
      },
    });

    return data.candidate_askForRegistration;
  };

const UPDATE_CONTACT = gql`
  mutation update_contact(
    $candidateId: ID!
    $candidateData: UpdateCandidateInput!
  ) {
    candidacy_updateContact(
      candidateId: $candidateId
      candidateData: $candidateData
    ) {
      id
      firstname
      lastname
      phone
      email
    }
  }
`;

export const updateContact =
  (client: ApolloClient<object>) =>
  async ({
    candidateId,
    candidateData,
  }: {
    candidateId: string;
    candidateData: {
      firstname: string | null;
      lastname: string | null;
      phone: string | null;
      email: string | null;
    };
  }) => {
    const { data } = await client.mutate({
      mutation: UPDATE_CONTACT,
      variables: { candidateId, candidateData },
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
      id
      organism {
        id
        label
        contactAdministrativeEmail
        informationsCommerciales {
          nom
          telephone
          emailContact
        }
      }
      createdAt
      certification {
        id
        codeRncp
        label
        summary
        status
        financeModule
      }
      isCertificationPartial
      experiences {
        id
        title
        startedAt
        duration
        description
      }
      goals {
        id
      }
      candidacyStatuses {
        status
        isActive
      }
      department {
        id
      }
      candidacyDropOut {
        droppedOutAt
      }
      appointmentCount
      firstAppointmentOccuredAt
      certificateSkills
      otherTraining
      individualHourCount
      collectiveHourCount
      additionalHourCount
      basicSkills {
        label
      }
      mandatoryTrainings {
        label
      }
      feasibilityFormat
      feasibility {
        id
        feasibilityFileSentAt
        decision
        decisionComment
        decisionSentAt
        decisionFile {
          name
          url
        }
      }
      dematerializedFeasibilityFile {
        id
        sentToCandidateAt
        aapDecision
        aapDecisionComment
        prerequisites {
          label
          state
        }
        firstForeignLanguage
        secondForeignLanguage
        option
        blocsDeCompetences {
          certificationCompetenceBloc {
            id
            code
            label
            isOptional
            FCCompetences
            competences {
              id
              label
            }
          }
        }
        certificationCompetenceDetails {
          text
          certificationCompetence {
            id
            label
          }
        }
        swornStatementFile {
          name
          previewUrl
          url
          mimeType
        }
        candidacy {
          individualHourCount
          collectiveHourCount
          additionalHourCount
          basicSkills {
            label
            id
          }
          mandatoryTrainings {
            label
            id
          }
          certification {
            label
            codeRncp
            level
            degree {
              longLabel
              level
            }
          }
          goals {
            id
            label
            isActive
          }
          experiences {
            id
            title
            startedAt
            duration
            description
          }
          certificateSkills
          candidate {
            highestDegree {
              level
              longLabel
            }
            niveauDeFormationLePlusEleve {
              level
            }
            firstname
            firstname2
            firstname3
            lastname
            email
            givenName
            birthdate
            birthCity
            birthDepartment {
              label
              code
              region {
                code
                label
              }
            }
            nationality
            gender
            phone
            city
            street
            zip
          }
        }
        attachments {
          type
          file {
            name
            previewUrl
            mimeType
          }
        }
      }
      activeDossierDeValidation {
        id
        decision
        decisionComment
        decisionSentAt
      }
      jury {
        id
        dateOfSession
        timeOfSession
        timeSpecified
        addressOfSession
        informationOfSession
        result
        dateOfResult
        informationOfResult
        convocationFile {
          name
          url
        }
      }
      financeModule
      `;

const GET_CANDIDACY_BY_ID = gql`
  query getCandidacyById($id: ID!) {
    getCandidacyById(id: $id) {
      ${CANDIDACY_SELECTION}
    }
  }
`;

const CONFIRM_REGISTRATION = gql`
  mutation candidate_login($token: String!) {
    candidateLogged: candidate_login(token: $token) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
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
        data: { getReferential },
      },
    ] = await Promise.all([registrationMutation, referentialQuery]);

    return initializeApp({ candidateLogged, getReferential });
  };

const GET_CANDIDATE_WITH_CANDIDACY = gql`
  query candidate_getCandidateWithCandidacy {
    candidate: candidate_getCandidateWithCandidacy {
      id
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

export const getCandidateWithCandidacy = async (
  client: ApolloClient<object>,
) => {
  const { data } = await client.query({
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

function initializeApp({ candidateLogged, getReferential }: any) {
  return {
    tokens: candidateLogged.tokens,
    candidacy: formatCandidacy(candidateLogged.candidate, getReferential),
    referentials: {
      goals: getReferential.goals,
    },
  };
}

function formatCandidacy(candidate: any, getReferential: any) {
  let candidacy = candidate?.candidacy;
  if (candidacy) {
    const candidateGoals = candidacy.goals.map((g: any) => g.id);

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
    };

    candidacy = {
      ...candidate,
      ...candidacy,
      candidateId: candidate.id,
      candidacyStatus: candidacy.candidacyStatuses?.find(
        (s: { isActive: string; status: candidacyStatus }) => s.isActive,
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

const CREATE_OR_UPDATE_SWORN_STATEMENT = gql`
  mutation dematerialized_feasibility_file_createOrUpdateSwornStatement(
    $candidacyId: ID!
    $swornStatement: Upload!
  ) {
    dematerialized_feasibility_file_createOrUpdateSwornStatement(
      candidacyId: $candidacyId
      input: { swornStatement: $swornStatement }
    ) {
      id
    }
  }
`;

export const createOrUpdateSwornStatement =
  (client: ApolloClient<object>) =>
  ({
    candidacyId,
    swornStatement,
  }: {
    candidacyId: string;
    swornStatement: File;
  }) =>
    client.mutate({
      mutation: CREATE_OR_UPDATE_SWORN_STATEMENT,
      variables: { candidacyId, swornStatement },
      awaitRefetchQueries: true,
      refetchQueries: [
        { query: GET_CANDIDACY_BY_ID, variables: { id: candidacyId } },
      ],
    });
