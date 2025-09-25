import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAppointmentHelper } from "@/test/helpers/entities/create-appointment-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

test("get a candidacy appointments", async () => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "whatever",
      }),
    },
  });

  const getCandidacyById = graphql(`
    query getCandidacyByIdForAppointmentTest($id: ID!) {
      getCandidacyById(id: $id) {
        id
        appointments {
          id
          type
          title
          description
          date
          location
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
      appointments: [{ id: appointment.id }],
    },
  });
});
