/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Department } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import {
  organismDummy1,
  organismDummy2,
} from "../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

let ain: Department | null, paris: Department | null, loire: Department | null;

beforeAll(async () => {
  ain = await prismaClient.department.findFirst({
    where: { code: "01" },
  });
  paris = await prismaClient.department.findFirst({
    where: { code: "75" },
  });
  loire = await prismaClient.department.findFirst({
    where: { code: "42" },
  });

  const organism1 = await prismaClient.organism.create({
    data: organismDummy1,
  });
  const organism2 = await prismaClient.organism.create({
    data: organismDummy2,
  });

  await prismaClient.organismsOnDepartments.create({
    data: {
      departmentId: paris?.id || "",
      organismId: organism1?.id || "",
      isRemote: true,
      isOnSite: true,
    },
  });
  await prismaClient.organismsOnDepartments.create({
    data: {
      departmentId: loire?.id || "",
      organismId: organism2?.id || "",
      isRemote: true,
      isOnSite: true,
    },
  });
});

afterAll(async () => {
  await prismaClient.organismsOnDepartments.deleteMany({});
  await prismaClient.organism.deleteMany({});
});

test("should find certifications with keyword électricien available in Paris", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCertifications",
      arguments: {
        departmentId: paris?.id,
        searchText: "électricien",
        offset: 0,
        limit: 10,
      },
      returnFields: "{ rows { label }, info { totalRows } }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCertifications.rows).toEqual(
    expect.arrayContaining([
      { label: "BP Electricien" },
      { label: "CAP Electricien" },
    ])
  );
});

test("should have no certifications available in Ain", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCertifications",
      arguments: {
        departmentId: ain?.id,
        searchText: "électricien",
        offset: 0,
        limit: 10,
      },
      returnFields: "{ rows { label }, info { totalRows } }",
    },
  });
  const obj = resp.json();
  expect(obj.data.getCertifications.rows).toEqual(expect.arrayContaining([]));
  expect(obj.data.getCertifications.info.totalRows).toEqual(0);
});
