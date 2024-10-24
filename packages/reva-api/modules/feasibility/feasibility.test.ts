/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import {
  Account,
  Candidacy,
  Candidate,
  Certification,
  Department,
  File,
  Organism,
} from "@prisma/client";
import { FastifyInstance } from "fastify";

import { prismaClient } from "../../prisma/client";
import { certificationAuthorityStructureFixtures } from "../../test/fixtures/certification";
import {
  candidateJPL,
  organismIperia,
} from "../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

const CERTIFICATOR1_KEYCLOAK_ID = "9d9f3489-dc01-4fb8-8c9b-9af891f13c2e";
const CERTIFICATOR3_KEYCLOAK_ID = "34994753-656c-4afd-bf7e-e83604a22bbc";
const CERTIFICATOR2_KEYCLOAK_ID = "054fdfa8-2593-461c-85f5-39e4f189a4d2";

let organism: Organism,
  candidate: Candidate,
  candidacy: Candidacy,
  feasibilityFile: File,
  certificationA: Certification,
  certificationB: Certification,
  parisDepartment: Department,
  account75A_firstChoice: Account,
  account75A_secondChoice: Account,
  account75B: Account;

beforeAll(async () => {
  parisDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;

  organism = await prismaClient.organism.create({ data: organismIperia });

  candidate = await prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: parisDepartment?.id || "" },
  });

  candidacy = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  feasibilityFile = await prismaClient.file.create({
    data: {
      name: "filename",
      mimeType: "application/pdf",
      path: "filename",
    },
  });

  certificationA =
    (await prismaClient.certification.findFirst()) as Certification;

  certificationB = (
    await prismaClient.certification.findMany()
  )[1] as Certification;

  const authority75A_firstChoice =
    await prismaClient.certificationAuthority?.create({
      data: {
        certificationAuthorityStructureId:
          certificationAuthorityStructureFixtures.UIMM.id,
        certificationAuthorityOnDepartment: {
          create: { departmentId: parisDepartment?.id || "" },
        },
        certificationAuthorityOnCertification: {
          create: { certificationId: certificationA?.id || "" },
        },
        label: "Une 1ere autorité certificatrice du 75 sur la certification A",
      },
    });

  const authority75A_secondChoice =
    await prismaClient.certificationAuthority?.create({
      data: {
        certificationAuthorityStructureId:
          certificationAuthorityStructureFixtures.UIMM.id,
        certificationAuthorityOnDepartment: {
          create: { departmentId: parisDepartment?.id || "" },
        },
        certificationAuthorityOnCertification: {
          create: { certificationId: certificationA?.id || "" },
        },
        label: "Une 2e autorité certificatrice du 75 sur la certification A",
      },
    });

  const authority75B = await prismaClient.certificationAuthority?.create({
    data: {
      certificationAuthorityStructureId:
        certificationAuthorityStructureFixtures.UIMM.id,
      certificationAuthorityOnDepartment: {
        create: { departmentId: parisDepartment?.id || "" },
      },
      certificationAuthorityOnCertification: {
        create: { certificationId: certificationB?.id || "" },
      },
      label: "Une autorité certificatrice du 75 sur la certification B",
    },
  });

  account75A_firstChoice = await prismaClient.account.create({
    data: {
      keycloakId: CERTIFICATOR1_KEYCLOAK_ID,
      email: "certificator@vae.gouv.fr",
      certificationAuthorityId: authority75A_firstChoice.id,
    },
  });

  account75A_secondChoice = await prismaClient.account.create({
    data: {
      keycloakId: CERTIFICATOR2_KEYCLOAK_ID,
      email: "certificator2@vae.gouv.fr",
      certificationAuthorityId: authority75A_secondChoice.id,
    },
  });

  account75B = await prismaClient.account.create({
    data: {
      keycloakId: CERTIFICATOR3_KEYCLOAK_ID,
      email: "certificator3@vae.gouv.fr",
      certificationAuthorityId: authority75B.id,
    },
  });
});

async function createPendingFeasibility(account: Account) {
  return await prismaClient.feasibility.create({
    data: {
      candidacyId: candidacy.id,
      feasibilityUploadedPdf: {
        create: {
          feasibilityFileId: feasibilityFile.id,
        },
      },
      decision: "PENDING",
      certificationAuthorityId: account.certificationAuthorityId ?? "",
    },
  });
}

afterAll(async () => {
  await prismaClient.file.delete({ where: { id: feasibilityFile.id } });
  await prismaClient.candidacyLog.deleteMany({
    where: { candidacyId: candidacy.id },
  });
  await prismaClient.candidacy.delete({ where: { id: candidacy.id } });
  await prismaClient.candidate.delete({ where: { id: candidate.id } });
  await prismaClient.organism.delete({ where: { id: organism.id } });
  await prismaClient.account.delete({
    where: { id: account75A_firstChoice.id },
  });
  await prismaClient.account.delete({
    where: { id: account75A_secondChoice.id },
  });
  await prismaClient.account.delete({
    where: { id: account75B.id },
  });
  await prismaClient.certificationAuthority.deleteMany();
});

afterEach(async () => {
  await prismaClient.feasibility.deleteMany({});
});

test("should count all (2) feasibilities for admin user", async () => {
  await createPendingFeasibility(account75A_firstChoice);

  await createPendingFeasibility(account75A_secondChoice);

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
  await createPendingFeasibility(account75A_firstChoice);
  await createPendingFeasibility(account75A_secondChoice);

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR1_KEYCLOAK_ID,
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
  await createPendingFeasibility(account75A_firstChoice);

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR2_KEYCLOAK_ID,
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
  const feasibility = await createPendingFeasibility(account75A_firstChoice);

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR1_KEYCLOAK_ID,
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
  const feasiblity = await createPendingFeasibility(account75A_firstChoice);

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR3_KEYCLOAK_ID,
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
  const feasibility = await createPendingFeasibility(account75A_firstChoice);

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR1_KEYCLOAK_ID,
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
  await createPendingFeasibility(account75A_firstChoice);

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
  const feasiblity = await createPendingFeasibility(account75A_firstChoice);

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "Admissible",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR1_KEYCLOAK_ID,
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
  const feasiblity = await createPendingFeasibility(account75A_firstChoice);

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "Admissible",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR2_KEYCLOAK_ID,
    }),
  });
  expect(resp.statusCode).toBe(500);
});

test("should not validate a feasibility since certificator 3 doesn't handle it", async () => {
  const feasiblity = await createPendingFeasibility(account75A_firstChoice);

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "Admissible",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR3_KEYCLOAK_ID,
    }),
  });
  expect(resp.statusCode).toBe(500);
});

test("should reject a feasibility since certificator is allowed to do so", async () => {
  const feasiblity = await createPendingFeasibility(account75A_firstChoice);

  const resp = await postFeasibilityDecision({
    feasibilityId: feasiblity.id,
    decision: "Rejected",
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR1_KEYCLOAK_ID,
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
  const feasiblity = await createPendingFeasibility(account75B);

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATOR3_KEYCLOAK_ID,
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
