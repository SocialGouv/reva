/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import {
  Account,
  Candidate,
  Certification,
  Department,
  File,
  Organism,
} from "@prisma/client";

import {
  candidateJPL,
  organismIperia,
} from "../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { prismaClient } from "../../database/postgres/client";

const CERTIFICATOR_KEYCLOAK_ID = "9d9f3489-dc01-4fb8-8c9b-9af891f13c2e";
const OTHER_CERTIFICATOR_KEYCLOAK_ID = "34994753-656c-4afd-bf7e-e83604a22bbc";

let organism: Organism,
  candidate: Candidate,
  feasibilityFile: File,
  certification: Certification,
  otherCertification: Certification,
  ileDeFranceDepartment: Department,
  certificatorAccount: Account,
  otherCertificatorAccount: Account;

beforeAll(async () => {
  ileDeFranceDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;

  organism = await prismaClient.organism.create({ data: organismIperia });

  candidate = await prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: ileDeFranceDepartment?.id || "" },
  });

  feasibilityFile = await prismaClient.file.create({
    data: {
      name: "filename",
      mimeType: "application/pdf",
      content: Buffer.from([]),
    },
  });

  certification =
    (await prismaClient.certification.findFirst()) as Certification;

  otherCertification = (
    await prismaClient.certification.findMany()
  )[1] as Certification;

  const certificationAuthority =
    await prismaClient.certificationAuthority?.create({
      data: {
        certificationAuthorityOnDepartment: {
          create: { departmentId: ileDeFranceDepartment?.id || "" },
        },
        certificationAuthorityOnCertification: {
          create: { certificationId: certification?.id || "" },
        },
        label: "The authority",
      },
    });

  const otherCertificationAuthority =
    await prismaClient.certificationAuthority?.create({
      data: {
        certificationAuthorityOnDepartment: {
          create: { departmentId: ileDeFranceDepartment?.id || "" },
        },
        certificationAuthorityOnCertification: {
          create: { certificationId: otherCertification?.id || "" },
        },
        label: "The other authority",
      },
    });

  certificatorAccount = await prismaClient.account.create({
    data: {
      keycloakId: CERTIFICATOR_KEYCLOAK_ID,
      email: "certificator@vae.gouv.fr",
      certificationAuthorityId: certificationAuthority.id,
    },
  });

  otherCertificatorAccount = await prismaClient.account.create({
    data: {
      keycloakId: OTHER_CERTIFICATOR_KEYCLOAK_ID,
      email: "other.certificator@vae.gouv.fr",
      certificationAuthorityId: otherCertificationAuthority.id,
    },
  });
});

afterAll(async () => {
  await prismaClient.file.delete({ where: { id: feasibilityFile.id } });
  await prismaClient.candidate.delete({ where: { id: candidate.id } });
  await prismaClient.organism.delete({ where: { id: organism.id } });
  await prismaClient.account.delete({ where: { id: certificatorAccount.id } });
  await prismaClient.account.delete({
    where: { id: otherCertificatorAccount.id },
  });
  await prismaClient.certificationAuthority.deleteMany();
});

afterEach(async () => {
  await prismaClient.feasibility.deleteMany({});
  await prismaClient.candidacy.deleteMany({});
});

test("should count all (1) feasibilities for admin user", async () => {
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  await prismaClient.feasibility.create({
    data: { candidacyId: candidacy.id, feasibilityFileId: feasibilityFile.id },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "whatever",
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

test("should count all (1) available feasibility for certificator user", async () => {
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  await prismaClient.feasibility.create({
    data: { candidacyId: candidacy.id, feasibilityFileId: feasibilityFile.id },
  });

  const ileDeFranceRegion = (await prismaClient.region.findFirst({
    where: { departments: { some: { id: ileDeFranceDepartment.id } } },
  })) as Department;

  await prismaClient.candidaciesOnRegionsAndCertifications.create({
    data: {
      candidacyId: candidacy.id,
      regionId: ileDeFranceRegion.id,
      certificationId: certification.id,
      author: "unknown",
      isActive: true,
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_feasibility",
      keycloakId: CERTIFICATOR_KEYCLOAK_ID,
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
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  await prismaClient.feasibility.create({
    data: { candidacyId: candidacy.id, feasibilityFileId: feasibilityFile.id },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_feasibility",
      keycloakId: CERTIFICATOR_KEYCLOAK_ID,
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
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  const feasiblity = await prismaClient.feasibility.create({
    data: { candidacyId: candidacy.id, feasibilityFileId: feasibilityFile.id },
  });

  const ileDeFranceRegion = (await prismaClient.region.findFirst({
    where: { departments: { some: { id: ileDeFranceDepartment.id } } },
  })) as Department;

  await prismaClient.candidaciesOnRegionsAndCertifications.create({
    data: {
      candidacyId: candidacy.id,
      regionId: ileDeFranceRegion.id,
      certificationId: certification.id,
      author: "unknown",
      isActive: true,
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_feasibility",
      keycloakId: CERTIFICATOR_KEYCLOAK_ID,
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibility",
      arguments: { feasibilityId: feasiblity.id },
      returnFields: "{id}",
    },
  });

  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data?.feasibility).toMatchObject({
    id: feasiblity.id,
  });
  expect(resp.json()).not.toHaveProperty("errors");
});

test("should return a feasibility error for other certificator since he doesn't handle it", async () => {
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  const feasiblity = await prismaClient.feasibility.create({
    data: { candidacyId: candidacy.id, feasibilityFileId: feasibilityFile.id },
  });

  const ileDeFranceRegion = (await prismaClient.region.findFirst({
    where: { departments: { some: { id: ileDeFranceDepartment.id } } },
  })) as Department;

  await prismaClient.candidaciesOnRegionsAndCertifications.create({
    data: {
      candidacyId: candidacy.id,
      regionId: ileDeFranceRegion.id,
      certificationId: certification.id,
      author: "unknown",
      isActive: true,
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_feasibility",
      keycloakId: OTHER_CERTIFICATOR_KEYCLOAK_ID,
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibility",
      arguments: { feasibilityId: feasiblity.id },
      returnFields: "{id}",
    },
  });

  expect(resp.json()).toHaveProperty("errors");
  expect(resp.json()).not.toHaveProperty("data");
});

test("should return all (1) available feasibility for certificateur user", async () => {
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  const feasibility = await prismaClient.feasibility.create({
    data: { candidacyId: candidacy.id, feasibilityFileId: feasibilityFile.id },
  });

  const ileDeFranceRegion = (await prismaClient.region.findFirst({
    where: { departments: { some: { id: ileDeFranceDepartment.id } } },
  })) as Department;

  await prismaClient.candidaciesOnRegionsAndCertifications.create({
    data: {
      candidacyId: candidacy.id,
      regionId: ileDeFranceRegion.id,
      certificationId: certification.id,
      author: "unknown",
      isActive: true,
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_feasibility",
      keycloakId: CERTIFICATOR_KEYCLOAK_ID,
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
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate.email,
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
    },
  });

  await prismaClient.feasibility.create({
    data: {
      candidacyId: candidacy.id,
      feasibilityFileId: feasibilityFile.id,
      decision: "PENDING",
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields: "{ALL,PENDING,ADMISSIBLE,REJECTED}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 1,
    PENDING: 1,
    ADMISSIBLE: 0,
    REJECTED: 0,
  });
});
