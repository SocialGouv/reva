import { AppointmentType } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAppointmentHelper } from "@/test/helpers/entities/create-appointment-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const graphqlClient = getGraphQLClient({
  headers: {
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "whatever",
    }),
  },
});

test("get a candidacy appointments", async () => {
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

test("create an appointment", async () => {
  const createAppointment = graphql(`
    mutation createAppointment($input: CreateAppointmentInput!) {
      appointment_createAppointment(input: $input) {
        title
        type
        date
        description
        location
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const res = await graphqlClient.request(createAppointment, {
    input: {
      candidacyId: candidacy.id,
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      title: "Test Appointment",
      description: "Test Description",
      location: "Test Location",
      date: "2025-09-26",
    },
  });

  expect(res).toMatchObject({
    appointment_createAppointment: {
      title: "Test Appointment",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: "2025-09-26",
      description: "Test Description",
      location: "Test Location",
    },
  });
});

test("update an appointment", async () => {
  const updateAppointment = graphql(`
    mutation updateAppointment($input: UpdateAppointmentInput!) {
      appointment_updateAppointment(input: $input) {
        title
        type
        date
        description
        location
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const appointment = await createAppointmentHelper({
    candidacyId: candidacy.id,
  });

  const res = await graphqlClient.request(updateAppointment, {
    input: {
      appointmentId: appointment.id,
      candidacyId: candidacy.id,
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      title: "Updated test Appointment",
      description: "Updated test Description",
      location: "Updated test Location",
      date: "2025-09-26",
    },
  });

  expect(res).toMatchObject({
    appointment_updateAppointment: {
      title: "Updated test Appointment",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: "2025-09-26",
      description: "Updated test Description",
      location: "Updated test Location",
    },
  });
});
