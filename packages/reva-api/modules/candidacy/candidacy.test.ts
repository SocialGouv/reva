/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { faker } from "@faker-js/faker/.";
import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "../../test/helpers/entities/create-candidate-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

test("get existing Candidacy with admin user", async () => {
  const candidacy = await createCandidacyHelper();
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCandidacyById",
      arguments: { id: candidacy.id },
      returnFields:
        "{organismId, candidate{firstname, lastname, email}, candidacyStatuses {createdAt, isActive, status}}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    organismId: candidacy.organismId,
    candidate: {
      firstname: candidacy.candidate?.firstname,
      lastname: candidacy.candidate?.lastname,
      email: candidacy.candidate?.email,
    },
  });
});

test("get non existing candidacy should yield errors", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCandidacyById",
      arguments: { id: "notfound" },
      returnFields: "{id}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("a user can't modify the account information of another candidate", async () => {
  const candidate = await createCandidateHelper();
  const anotherCandidate = await createCandidateHelper();
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidate.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateContact",
      arguments: {
        candidateId: anotherCandidate.id,
        candidateData: { phone: "0612345678" },
      },
      returnFields: "{id}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("a candidate can modify his account information but not directly his email, it needs to be confirm via an email link", async () => {
  const candidate = await createCandidateHelper();
  const newCandidate = {
    firstname: "Updated Firstname",
    lastname: "Updated Lastname",
    phone: "0612345678",
  };

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidate.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateContact",
      arguments: {
        candidateId: candidate.id,
        candidateData: {
          firstname: newCandidate.firstname,
          lastname: newCandidate.lastname,
          phone: newCandidate.phone,
          email: faker.internet.email(),
        },
      },
      returnFields: "{id,firstname,lastname,phone,email}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().data.candidacy_updateContact).toMatchObject({
    id: candidate.id,
    email: candidate.email,
    ...newCandidate,
  });

  const updatedCandidate = await prismaClient.candidate.findUnique({
    where: { id: candidate.id },
  });

  expect(updatedCandidate).toMatchObject(newCandidate);
});
