import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

test("a candidate can get his own information", async () => {
  const candidate = await createCandidateHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidate.keycloakId,
      }),
    },
  });

  const candidate_getCandidateById = graphql(`
    query candidate_getCandidateById($id: ID!) {
      candidate_getCandidateById(id: $id) {
        id
        firstname
        lastname
        email
      }
    }
  `);

  const res = await graphqlClient.request(candidate_getCandidateById, {
    id: candidate.id,
  });

  expect(res).toMatchObject({
    candidate_getCandidateById: {
      id: candidate.id,
      firstname: candidate.firstname,
      lastname: candidate.lastname,
      email: candidate.email,
    },
  });
});

test("a candidate can't get the information of another candidate", async () => {
  const candidate = await createCandidateHelper();
  const anotherCandidate = await createCandidateHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidate.keycloakId,
      }),
    },
  });

  const candidate_getCandidateById = graphql(`
    query candidate_getCandidateById($id: ID!) {
      candidate_getCandidateById(id: $id) {
        id
        firstname
        lastname
        email
      }
    }
  `);

  await expect(
    graphqlClient.request(candidate_getCandidateById, {
      id: anotherCandidate.id,
    }),
  ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
});

test("a candidate can't get the information of an invalid candidate ID", async () => {
  const candidate = await createCandidateHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidate.keycloakId,
      }),
    },
  });

  const candidate_getCandidateById = graphql(`
    query candidate_getCandidateById($id: ID!) {
      candidate_getCandidateById(id: $id) {
        id
        firstname
        lastname
        email
      }
    }
  `);

  await expect(
    graphqlClient.request(candidate_getCandidateById, {
      id: "invalid-id",
    }),
  ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
});

test("an admin can get the information of a candidate", async () => {
  const admin = await createCandidateHelper();
  const anotherCandidate = await createCandidateHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: admin.keycloakId,
      }),
    },
  });

  const candidate_getCandidateById = graphql(`
    query candidate_getCandidateById($id: ID!) {
      candidate_getCandidateById(id: $id) {
        id
        firstname
        lastname
        email
      }
    }
  `);

  const res = await graphqlClient.request(candidate_getCandidateById, {
    id: anotherCandidate.id,
  });

  expect(res).toMatchObject({
    candidate_getCandidateById: {
      id: anotherCandidate.id,
      firstname: anotherCandidate.firstname,
      lastname: anotherCandidate.lastname,
      email: anotherCandidate.email,
    },
  });
});
