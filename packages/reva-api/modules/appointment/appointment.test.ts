import { AppointmentType } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAppointmentHelper } from "@/test/helpers/entities/create-appointment-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createFeatureHelper } from "@/test/helpers/entities/create-feature-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const graphqlClient = getGraphQLClient({
  headers: {
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    }),
  },
});

beforeEach(async () => {
  await createFeatureHelper({
    args: {
      key: "APPOINTMENTS",
      label: "APPOINTMENTS",
      isActive: true,
    },
  });
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

test("should create an appointment", async () => {
  const createAppointment = graphql(`
    mutation createAppointment($input: CreateAppointmentInput!) {
      appointment_createAppointment(input: $input) {
        title
        type
        date
        time
        description
        location
        duration
      }
    }
  `);

  const candidacy = await createCandidacyHelper();

  const res = await graphqlClient.request(createAppointment, {
    input: {
      candidacyId: candidacy.id,
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      title: "Test Appointment",
      time: "10:00:00.000Z",
      description: "Test Description",
      location: "Test Location",
      date: "2025-09-26",
      duration: "ONE_HOUR",
    },
  });

  expect(res).toMatchObject({
    appointment_createAppointment: {
      title: "Test Appointment",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: "2025-09-26",
      time: "10:00:00.000Z",
      description: "Test Description",
      location: "Test Location",
      duration: "ONE_HOUR",
    },
  });
});

test("should not create an appointment and throw an error if there is already a rendez-vous pédagogique", async () => {
  const createAppointment = graphql(`
    mutation createAppointment($input: CreateAppointmentInput!) {
      appointment_createAppointment(input: $input) {
        title
        type
        date
        time
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
        time: "10:00:00.000Z",
        description: "Test Description",
        location: "Test Location",
        date: "2025-09-26",
        duration: "ONE_HOUR",
      },
    }),
  ).rejects.toThrowError(
    "Il y a déjà un rendez-vous pédagogique pour cette candidature",
  );
});

test("should update an appointment when it is not past", async () => {
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
      date: "2225-09-26",
      duration: "TWO_HOURS",
    },
  });

  expect(res).toMatchObject({
    appointment_updateAppointment: {
      title: "Updated test Appointment",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: "2225-09-26",
      description: "Updated test Description",
      location: "Updated test Location",
      duration: "TWO_HOURS",
    },
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
        date: "2225-09-26",
        duration: "TWO_HOURS",
      },
    }),
  ).rejects.toThrowError("Impossible de modifier un rendez-vous passé");
});
