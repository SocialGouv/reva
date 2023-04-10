/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Candidacy, Candidate, Organism } from "@prisma/client";

import {
  candidateJPL,
  organismIperia,
} from "../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { prismaClient } from "../../database/postgres/client";

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
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });
});

afterAll(async () => {
  await prismaClient.candidacy.delete({ where: { id: candidacy.id } });
  await prismaClient.candidate.delete({ where: { id: candidate.id } });
  await prismaClient.organism.delete({ where: { id: organism.id } });
});

test("candidacy_takeOver should fail when not authenticated", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacy.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
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
        "{organismId, firstname, lastname, email, candidacyStatuses {createdAt, isActive, status}}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    organismId: organism.id,
    firstname: candidate.firstname,
    lastname: candidate.lastname,
    email: candidate.email,
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
