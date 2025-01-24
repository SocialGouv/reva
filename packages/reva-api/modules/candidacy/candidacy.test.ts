/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { faker } from "@faker-js/faker/.";
import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "../../test/helpers/entities/create-candidate-helper";

import {
  getGraphqlClient,
  getQraphQLError,
} from "../../test/jestGraphqlClient";
import { graphql } from "../graphql/generated";

test("get existing Candidacy with admin user", async () => {
  const candidacy = await createCandidacyHelper();

  const graphqlClient = getGraphqlClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "whatever",
      }),
    },
  });

  const getCandidacyById = graphql(`
    query getCandidacyById_with_admin_user($id: ID!) {
      getCandidacyById(id: $id) {
        organismId
        candidate {
          firstname
          lastname
          email
        }
        candidacyStatuses {
          createdAt
          isActive
          status
        }
      }
    }
  `);

  const res = await graphqlClient.request(getCandidacyById, {
    id: candidacy.id,
  });

  expect(res).toMatchObject({
    getCandidacyById: {
      organismId: candidacy.organismId,
      candidate: {
        firstname: candidacy.candidate?.firstname,
        lastname: candidacy.candidate?.lastname,
        email: candidacy.candidate?.email,
      },
    },
  });
});

test("get non existing candidacy should yield errors", async () => {
  const graphqlClient = getGraphqlClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "whatever",
      }),
    },
  });

  const getCandidacyById = graphql(`
    query getCandidacyById_does_not_exist($id: ID!) {
      getCandidacyById(id: $id) {
        id
      }
    }
  `);

  const res = await graphqlClient.request(getCandidacyById, {
    id: "fb53327b-8ed9-4238-8e80-007fa1ddcfe6",
  });

  expect(res).toMatchObject({
    getCandidacyById: null,
  });
});

test("a user can't modify the account information of another candidate", async () => {
  const candidate = await createCandidateHelper();
  const anotherCandidate = await createCandidateHelper();

  const graphqlClient = getGraphqlClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidate.keycloakId,
      }),
    },
  });

  const candidacy_updateContact = graphql(`
    mutation candidacy_updateContact_of_different_candidate(
      $candidateId: ID!
      $candidateData: UpdateCandidateInput!
    ) {
      candidacy_updateContact(
        candidateId: $candidateId
        candidateData: $candidateData
      ) {
        id
      }
    }
  `);

  try {
    await graphqlClient.request(candidacy_updateContact, {
      candidateId: anotherCandidate.id,
      candidateData: { phone: "0612345678" },
    });
  } catch (error) {
    const gqlError = getQraphQLError(error);
    expect(gqlError).toEqual(
      "Vous n'êtes pas autorisé à accéder à cette candidature",
    );
  }
});

test("a candidate can modify his account information but not directly his email, it needs to be confirm via an email link", async () => {
  const candidate = await createCandidateHelper();
  const newCandidate = {
    firstname: "Updated Firstname",
    lastname: "Updated Lastname",
    phone: "0612345678",
  };

  const graphqlClient = getGraphqlClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidate.keycloakId,
      }),
    },
  });

  const candidacy_updateContact = graphql(`
    mutation candidacy_updateContact_of_same_candidate(
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
  `);

  const res = await graphqlClient.request(candidacy_updateContact, {
    candidateId: candidate.id,
    candidateData: {
      firstname: newCandidate.firstname,
      lastname: newCandidate.lastname,
      phone: newCandidate.phone,
      email: faker.internet.email(),
    },
  });

  expect(res).toMatchObject({
    candidacy_updateContact: {
      id: candidate.id,
      email: candidate.email,
      ...newCandidate,
    },
  });

  const updatedCandidate = await prismaClient.candidate.findUnique({
    where: { id: candidate.id },
  });

  expect(updatedCandidate).toMatchObject(newCandidate);
});
