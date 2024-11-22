/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { FastifyInstance } from "fastify";

import { randomUUID } from "crypto";
import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "../../test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

afterEach(async () => {
  await prismaClient.feasibility.deleteMany({});
});

test("should count all (2) feasibilities for admin user", async () => {
  await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields: "{ALL}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 2,
  });
});

test("should count all (1) available feasibility for certificator user even if other exists on the same scope", async () => {
  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure?.certificationAuthorities[0];
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });
  await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });
  await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: certificationAuthority?.Account[0].keycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields: "{ALL}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 1,
  });
});

test("should count no available feasibility for certificator user since he doesn't handle the related certifications", async () => {
  await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: randomUUID(),
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields: "{ALL}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 0,
  });
});

test("should return a feasibilty for certificator since he is allowed to handle it", async () => {
  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure?.certificationAuthorities[0];
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: certificationAuthority?.Account[0].keycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibility",
      arguments: { feasibilityId: feasibility.id },
      returnFields: "{id}",
    },
  });

  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data?.feasibility).toMatchObject({
    id: feasibility.id,
  });
  expect(resp.json()).not.toHaveProperty("errors");
});

test("should return a feasibility error for certificator 3 since he doesn't handle it", async () => {
  const feasiblity = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: randomUUID(),
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibility",
      arguments: { feasibilityId: feasiblity.id },
      returnFields: "{id}",
    },
  });

  expect(resp.json()).toHaveProperty("errors");
});

test("should return all (1) available feasibility for certificateur user", async () => {
  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure?.certificationAuthorities[0];
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: certificationAuthority?.Account[0].keycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields:
        "{rows{id},info{totalRows,currentPage,totalPages,pageLength}}",
    },
  });

  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilities).toMatchObject({
    rows: [{ id: feasibility.id }],
    info: { currentPage: 1, totalPages: 1, totalRows: 1, pageLength: 10 },
  });
});

test("should count 1 pending feasibility for admin user", async () => {
  await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields: "{ALL,PENDING,ADMISSIBLE,REJECTED,INCOMPLETE}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 1,
    PENDING: 1,
    ADMISSIBLE: 0,
    REJECTED: 0,
    INCOMPLETE: 0,
  });
});

const postFeasibilityDecision = ({
  feasibilityId,
  decision,
  authorization,
}: {
  feasibilityId: string;
  decision: string;
  authorization: ReturnType<typeof authorizationHeaderForUser>;
}) => {
  const fastify = (global as any).fastify as FastifyInstance;

  return fastify.inject({
    method: "POST",
    url: `/api/feasibility/${feasibilityId}/decision`,
    payload: { decision: { value: decision } },
    headers: {
      authorization,
    },
  });
};

test("should validate a feasibility since certificator is allowed to do so", async () => {
  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure?.certificationAuthorities[0];
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });
  const feasiblity = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "ADMISSIBLE",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: certificationAuthority?.Account[0].keycloakId,
    }),
  });

  expect(resp.statusCode).toEqual(200);
  const obj = JSON.parse(resp.body);

  expect(obj).toMatchObject({
    id: feasiblity.id,
    decision: "ADMISSIBLE",
  });
});

test("should not validate a feasibility since certificator 2 doesn't handle it, even if he is on the same scope as certificator 1", async () => {
  const feasiblity = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "ADMISSIBLE",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: randomUUID(),
    }),
  });
  expect(resp.statusCode).toBe(500);
});

test("should not validate a feasibility since certificator 3 doesn't handle it", async () => {
  const feasiblity = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "ADMISSIBLE",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: randomUUID(),
    }),
  });
  expect(resp.statusCode).toBe(500);
});

test("should reject a feasibility since certificator is allowed to do so", async () => {
  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure?.certificationAuthorities[0];
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });
  const feasiblity = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "REJECTED",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: certificationAuthority?.Account[0].keycloakId,
    }),
  });

  expect(resp.statusCode).toEqual(200);

  const obj = JSON.parse(resp.body);

  expect(obj).toMatchObject({
    id: feasiblity.id,
  });

  expect(obj).toMatchObject({
    id: feasiblity.id,
    decision: "REJECTED",
  });
});

test("should not reject a feasibility since certificator 3 doesn't handle it", async () => {
  const feasiblity = await createFeasibilityUploadedPdfHelper({
    decision: "PENDING",
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: randomUUID(),
    }),
    payload: {
      requestType: "query",
      endpoint: "rejectFeasibility",
      arguments: { feasibilityId: feasiblity.id },
      returnFields: "{id}",
    },
  });

  expect(resp.json()).toHaveProperty("errors");
});
