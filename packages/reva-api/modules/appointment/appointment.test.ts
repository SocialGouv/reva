import { AppointmentType } from "@prisma/client";

import * as EmailModule from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAppointmentHelper } from "@/test/helpers/entities/create-appointment-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { getCandidateAppUrl } from "../candidate/utils/candidate.url.helpers";
import { graphql } from "../graphql/generated";

const graphqlClient = getGraphQLClient({
  headers: {
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    }),
  },
});

test("should get a candidacy appointments", async () => {
  const getCandidacyById = graphql(`
    query getCandidacyByIdForAppointmentTest($id: ID!) {
      getCandidacyById(id: $id) {
        id
        appointments {
          rows {
            id
            type
            title
            description
            date
            location
            duration
          }
        }
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const appointment = await createAppointmentHelper({
    candidacyId: candidacy.id,
  });

  const res = await graphqlClient.request(getCandidacyById, {
    id: candidacy.id,
  });

  expect(res).toMatchObject({
    getCandidacyById: {
      appointments: {
        rows: [{ id: appointment.id }],
      },
    },
  });
});

test("should get an appointment by its id", async () => {
  const getAppointmentById = graphql(`
    query getAppointmentByIdForAppointmentTest(
      $candidacyId: ID!
      $appointmentId: ID!
    ) {
      appointment_getAppointmentById(
        candidacyId: $candidacyId
        appointmentId: $appointmentId
      ) {
        id
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const appointment = await createAppointmentHelper({
    candidacyId: candidacy.id,
  });

  const res = await graphqlClient.request(getAppointmentById, {
    candidacyId: candidacy.id,
    appointmentId: appointment.id,
  });

  expect(res).toMatchObject({
    appointment_getAppointmentById: {
      id: appointment.id,
    },
  });
});

test("should create an appointment and send an email to the candidate", async () => {
  const sendEmailUsingTemplateSpy = vi.spyOn(
    EmailModule,
    "sendEmailUsingTemplate",
  );

  const createAppointment = graphql(`
    mutation createAppointment($input: CreateAppointmentInput!) {
      appointment_createAppointment(input: $input) {
        id
        title
        type
        date
        description
        location
        duration
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  //ensure the candidate is in ile de france to avoid timezone issues
  const ileDeFranceDepartment = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  await prismaClient.candidate.update({
    where: { id: candidacy.candidate?.id },
    data: {
      departmentId: ileDeFranceDepartment?.id,
    },
  });

  const res = await graphqlClient.request(createAppointment, {
    input: {
      candidacyId: candidacy.id,
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      title: "Test Appointment",
      description: "Test Description",
      location: "Test Location",
      date: "2225-09-26T10:00:00.000Z",
      duration: "ONE_HOUR",
      sendEmailToCandidate: true,
    },
  });

  expect(res).toMatchObject({
    appointment_createAppointment: {
      title: "Test Appointment",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: "2225-09-26T10:00:00.000Z",
      description: "Test Description",
      location: "Test Location",
      duration: "ONE_HOUR",
    },
  });

  expect(sendEmailUsingTemplateSpy).toHaveBeenCalledWith({
    to: { email: candidacy.candidate?.email },
    params: {
      candidateFullName:
        candidacy.candidate?.firstname + " " + candidacy.candidate?.lastname,
      appointmentDate: "26/09/2225",
      appointmentTime: "12:00",
      appointmentUrl: `${getCandidateAppUrl()}/${candidacy.id}/appointments/${res.appointment_createAppointment.id}`,
    },
    templateId: 632,
  });
});

test("should not create an appointment and throw an error if there is already a rendez-vous pédagogique", async () => {
  const createAppointment = graphql(`
    mutation createAppointment($input: CreateAppointmentInput!) {
      appointment_createAppointment(input: $input) {
        id
        title
        type
        date
        description
        location
        duration
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  // Create a rendez-vous pédagogique
  await createAppointmentHelper({
    candidacyId: candidacy.id,
    type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
  });

  await expect(
    graphqlClient.request(createAppointment, {
      input: {
        candidacyId: candidacy.id,
        type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
        title: "Test Appointment",
        description: "Test Description",
        location: "Test Location",
        date: "2025-09-26T10:00:00.000Z",
        duration: "ONE_HOUR",
      },
    }),
  ).rejects.toThrowError(
    "Il y a déjà un rendez-vous pédagogique pour cette candidature",
  );
});

test("should not create an appointment if it's date is in the past", async () => {
  const createAppointment = graphql(`
    mutation createAppointment($input: CreateAppointmentInput!) {
      appointment_createAppointment(input: $input) {
        id
        title
        type
        date
        description
        location
        duration
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  await expect(
    graphqlClient.request(createAppointment, {
      input: {
        candidacyId: candidacy.id,
        type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
        title: "Test Appointment",
        description: "Test Description",
        location: "Test Location",
        date: "2005-09-26T10:00:00.000Z",
        duration: "ONE_HOUR",
      },
    }),
  ).rejects.toThrowError("Impossible de créer un rendez-vous passé");
});

test("should update an appointment when it is not past and send an email to the candidate", async () => {
  const sendEmailUsingTemplateSpy = vi.spyOn(
    EmailModule,
    "sendEmailUsingTemplate",
  );

  const updateAppointment = graphql(`
    mutation updateAppointment($input: UpdateAppointmentInput!) {
      appointment_updateAppointment(input: $input) {
        title
        type
        date
        description
        location
        duration
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const appointment = await createAppointmentHelper({
    candidacyId: candidacy.id,
    date: new Date("2225-08-12"),
  });

  const res = await graphqlClient.request(updateAppointment, {
    input: {
      appointmentId: appointment.id,
      candidacyId: candidacy.id,
      title: "Updated test Appointment",
      description: "Updated test Description",
      location: "Updated test Location",
      date: "2225-09-26T10:00:00.000Z",
      duration: "TWO_HOURS",
    },
  });

  expect(res).toMatchObject({
    appointment_updateAppointment: {
      title: "Updated test Appointment",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: "2225-09-26T10:00:00.000Z",
      description: "Updated test Description",
      location: "Updated test Location",
      duration: "TWO_HOURS",
    },
  });

  expect(sendEmailUsingTemplateSpy).toHaveBeenCalledWith({
    to: { email: candidacy.candidate?.email },
    params: {
      candidateFullName:
        candidacy.candidate?.firstname + " " + candidacy.candidate?.lastname,
      appointmentUrl: `${getCandidateAppUrl()}/${appointment.candidacyId}/appointments/${appointment.id}`,
    },
    templateId: 633,
  });
});

test("should not update an appointment when it is past", async () => {
  const updateAppointment = graphql(`
    mutation updateAppointment($input: UpdateAppointmentInput!) {
      appointment_updateAppointment(input: $input) {
        title
        type
        date
        description
        location
        duration
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const appointment = await createAppointmentHelper({
    candidacyId: candidacy.id,
    date: new Date("1999-08-12"),
  });

  await expect(() =>
    graphqlClient.request(updateAppointment, {
      input: {
        appointmentId: appointment.id,
        candidacyId: candidacy.id,
        title: "Updated test Appointment",
        description: "Updated test Description",
        location: "Updated test Location",
        date: "2225-09-26T10:00:00.000Z",
        duration: "TWO_HOURS",
      },
    }),
  ).rejects.toThrowError("Impossible de modifier un rendez-vous passé");
});

test("should delete an upcoming appointment of type RENDEZ_VOUS_DE_SUIVI and send an email to the candidate", async () => {
  const sendEmailUsingTemplateSpy = vi.spyOn(
    EmailModule,
    "sendEmailUsingTemplate",
  );

  const deleteAppointment = graphql(`
    mutation deleteAppointment($candidacyId: ID!, $appointmentId: ID!) {
      appointment_deleteAppointment(
        candidacyId: $candidacyId
        appointmentId: $appointmentId
      ) {
        id
      }
    }
  `);

  const appointment = await createAppointmentHelper({
    date: new Date("2225-08-12:10:00:00Z"),
    type: AppointmentType.RENDEZ_VOUS_DE_SUIVI,
  });

  const ileDeFranceDepartment = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  //ensure the candidate is in ile de france to avoid timezone issues
  await prismaClient.candidate.update({
    where: { id: appointment.candidacy.candidate?.id },
    data: {
      departmentId: ileDeFranceDepartment?.id,
    },
  });

  const res = await graphqlClient.request(deleteAppointment, {
    candidacyId: appointment.candidacyId,
    appointmentId: appointment.id,
  });

  expect(res).toMatchObject({
    appointment_deleteAppointment: {
      id: appointment.id,
    },
  });

  const deleteAppointmentInDatabase = await prismaClient.appointment.findUnique(
    {
      where: { id: appointment.id },
    },
  );

  expect(deleteAppointmentInDatabase).toBeNull();

  expect(sendEmailUsingTemplateSpy).toHaveBeenCalledWith({
    to: { email: appointment.candidacy.candidate?.email },
    params: {
      candidateFullName:
        appointment.candidacy.candidate?.firstname +
        " " +
        appointment.candidacy.candidate?.lastname,
      appointmentDate: "12/08/2225",
      appointmentTime: "12:00",
      appointmentUrl: `${getCandidateAppUrl()}/${appointment.candidacyId}/appointments/${appointment.id}`,
    },
    templateId: 634,
  });
});

test("should not delete an appointment of type RENDEZ_VOUS_DE_SUIVI when it is past", async () => {
  const deleteAppointment = graphql(`
    mutation deleteAppointment($candidacyId: ID!, $appointmentId: ID!) {
      appointment_deleteAppointment(
        candidacyId: $candidacyId
        appointmentId: $appointmentId
      ) {
        id
      }
    }
  `);

  const appointment = await createAppointmentHelper({
    date: new Date("1999-08-12"),
    type: AppointmentType.RENDEZ_VOUS_DE_SUIVI,
  });

  await expect(() =>
    graphqlClient.request(deleteAppointment, {
      candidacyId: appointment.candidacyId,
      appointmentId: appointment.id,
    }),
  ).rejects.toThrowError("Impossible de supprimer un rendez-vous passé");
});

test("should not delete an appointment of type RENDEZ_VOUS_PEDAGOGIQUE", async () => {
  const deleteAppointment = graphql(`
    mutation deleteAppointment($candidacyId: ID!, $appointmentId: ID!) {
      appointment_deleteAppointment(
        candidacyId: $candidacyId
        appointmentId: $appointmentId
      ) {
        id
      }
    }
  `);

  const appointment = await createAppointmentHelper({
    type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
    date: new Date("2225-08-12"),
  });

  await expect(() =>
    graphqlClient.request(deleteAppointment, {
      candidacyId: appointment.candidacyId,
      appointmentId: appointment.id,
    }),
  ).rejects.toThrowError("Impossible de supprimer un rendez-vous pedagogique");
});
