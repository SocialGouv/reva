/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Candidacy, Candidate, Organism } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import {
  candidateJPL,
  organismIperia,
} from "../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

let organism: Organism, candidate: Candidate, candidacy: Candidacy;

beforeAll(async () => {
  const ileDeFrance = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  organism = await prismaClient.organism.create({ data: organismIperia });
  candidate = await prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: ileDeFrance?.id || "" },
  });
  candidacy = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });
});

afterAll(async () => {
  await prismaClient.candidacyLog.deleteMany({
    where: { candidacyId: candidacy.id },
  });
  await prismaClient.candidacy.delete({ where: { id: candidacy.id } });
  await prismaClient.candidate.delete({ where: { id: candidate.id } });
  await prismaClient.organism.delete({ where: { id: organism.id } });
});

test("get existing Candidacy with admin user", async () => {
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
    organismId: organism.id,
    candidate: {
      firstname: candidate.firstname,
      lastname: candidate.lastname,
      email: candidate.email,
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
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "20d793c8-4269-44fd-a454-c6b7ab8b4c8e",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateContact",
      arguments: {
        candidateId: candidate.id,
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
  const newCandidate = {
    firstname: "John",
    lastname: "Doe",
    phone: "0612345678",
    email: "jean-pat.ledru@gmail.com",
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
          email: newCandidate.email,
        },
      },
      returnFields: "{id,firstname,lastname,phone,email}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().data.candidacy_updateContact).toMatchObject({
    id: candidate.id,
    ...newCandidate,
  });

  const updatedCandidate = await prismaClient.candidate.findUnique({
    where: { id: candidate.id },
  });

  expect(updatedCandidate).toMatchObject(newCandidate);
});
