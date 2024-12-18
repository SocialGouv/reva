/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { createDossierDeValidationHelper } from "../../test/helpers/entities/create-dossier-de-validation-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";

let dossiersDeValidation: Awaited<
  ReturnType<typeof createDossierDeValidationHelper>
>[] = [];

beforeEach(async () => {
  dossiersDeValidation = await Promise.all([
    createDossierDeValidationHelper({
      decision: "PENDING",
    }),
    createDossierDeValidationHelper({
      decision: "PENDING",
    }),

    createDossierDeValidationHelper({
      decision: "PENDING",
    }),

    createDossierDeValidationHelper({
      decision: "PENDING",
      isActive: false,
    }),

    createDossierDeValidationHelper({
      decision: "INCOMPLETE",
    }),

    createDossierDeValidationHelper({
      decision: "INCOMPLETE",
    }),
    createDossierDeValidationHelper({
      decision: "INCOMPLETE",
      isActive: false,
    }),
  ]);
});

afterEach(async () => {
  await clearDatabase();
});

test("should count 1 dossier de validation by email for admin user", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_dossierDeValidationCountByCategory",
      returnFields: "{ALL,PENDING,INCOMPLETE}",
      arguments: {
        searchFilter: dossiersDeValidation[0].candidacy.candidate?.email,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(
    obj.data.dossierDeValidation_dossierDeValidationCountByCategory,
  ).toMatchObject({
    ALL: 1,
    PENDING: 1,
    INCOMPLETE: 0,
  });

  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter: dossiersDeValidation[0].candidacy.candidate?.email,
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows[0].id,
  ).toEqual(dossiersDeValidation[0].id);
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});

test("should count 1 PENDING dossier de validation by name for admin user", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_dossierDeValidationCountByCategory",
      returnFields: "{ALL,PENDING,INCOMPLETE}",
      arguments: {
        searchFilter:
          dossiersDeValidation[0].candidacy.candidate?.firstname +
          " " +
          dossiersDeValidation[0].candidacy.candidate?.lastname,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(
    obj.data.dossierDeValidation_dossierDeValidationCountByCategory,
  ).toMatchObject({
    ALL: 1,
    PENDING: 1,
    INCOMPLETE: 0,
  });
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter:
          dossiersDeValidation[0].candidacy.candidate?.firstname +
          " " +
          dossiersDeValidation[0].candidacy.candidate?.lastname,
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows[0].id,
  ).toEqual(dossiersDeValidation[0].id);
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});

test("should count active dossiers de validation by status for admin user searched by rncp type diplome", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_dossierDeValidationCountByCategory",
      returnFields: "{ALL,PENDING,INCOMPLETE}",
      arguments: {
        searchFilter:
          dossiersDeValidation[0].candidacy.certification?.rncpTypeDiplome,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(
    obj.data.dossierDeValidation_dossierDeValidationCountByCategory,
  ).toMatchObject({
    ALL: 5,
    PENDING: 3,
    INCOMPLETE: 2,
  });

  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter:
          dossiersDeValidation[0].candidacy.certification?.rncpTypeDiplome,
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const feasibilityObj = ddvResp.json();
  expect(
    feasibilityObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(5);
});

test("should count all dossiers de validation by status for admin user", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_dossierDeValidationCountByCategory",
      returnFields: "{ALL,PENDING,INCOMPLETE}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(
    obj.data.dossierDeValidation_dossierDeValidationCountByCategory,
  ).toMatchObject({
    ALL: 5,
    PENDING: 3,
    INCOMPLETE: 2,
  });

  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(5);
});

/** ----------------------------------------------------------------- */
/**                     TEST PENDING FILES FILTER                     */
/** ----------------------------------------------------------------- */

test("should get 1 PENDING dossier de validation by email for admin user", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: dossiersDeValidation[0].candidacy.candidate?.email,
        categoryFilter: "PENDING",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows[0].id,
  ).toEqual(dossiersDeValidation[0].id);
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});

test("should get 1 PENDING dossier de validation by name for admin user", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          dossiersDeValidation[0].candidacy.candidate?.firstname +
          " " +
          dossiersDeValidation[0].candidacy.candidate?.lastname,
        categoryFilter: "PENDING",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows[0].id,
  ).toEqual(dossiersDeValidation[0].id);
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});

test("should get PENDING dossiers de validation by status for admin user searched by rncp type diplome", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          dossiersDeValidation[0].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "PENDING",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const feasibilityObj = ddvResp.json();
  expect(
    feasibilityObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(3);
});

test("should get all (3) PENDING dossiers de validation by status for admin user", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "PENDING",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(3);
});

// /** ----------------------------------------------------------------- */
// /**                     TEST INCOMPLETE FILES FILTER                  */
// /** ----------------------------------------------------------------- */

test("should get 1 INCOMPLETE dossier de validation by email for admin user", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: dossiersDeValidation[4].candidacy.candidate?.email,
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows[0].id,
  ).toEqual(dossiersDeValidation[4].id);
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});

test("should get 1 INCOMPLETE dossier de validation by name for admin user", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          dossiersDeValidation[4].candidacy.candidate?.firstname +
          " " +
          dossiersDeValidation[4].candidacy.candidate?.lastname,
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows[0].id,
  ).toEqual(dossiersDeValidation[4].id);
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});

test("should get INCOMPLETE dossiers de validation by status for admin user searched by rncp type diplome", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          dossiersDeValidation[4].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const feasibilityObj = ddvResp.json();
  expect(
    feasibilityObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(2);
});

test("should get all (3) INCOMPLETE dossiers de validation by status for admin user", async () => {
  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(2);
});

/** ----------------------------------------------------------------- */
/**                     TEST DEPARTMENT SEARCH FILTER                 */
/** ----------------------------------------------------------------- */

test("should count 1 dossier de validation when searching by department for admin user", async () => {
  const department = await prismaClient.department.findUnique({
    where: { code: "62" },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  const candidacy = await createCandidacyHelper({
    candidacyArgs: { departmentId: department.id },
    candidacyActiveStatus: "DOSSIER_DE_VALIDATION_ENVOYE",
  });

  await createDossierDeValidationHelper({
    candidacyId: candidacy.id,
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
      endpoint: "dossierDeValidation_dossierDeValidationCountByCategory",
      returnFields: "{ALL,PENDING,INCOMPLETE}",
      arguments: {
        searchFilter: "pas-de-calais",
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(
    obj.data.dossierDeValidation_dossierDeValidationCountByCategory,
  ).toMatchObject({
    ALL: 1,
    PENDING: 1,
    INCOMPLETE: 0,
  });
});

test("should return 1 dossier de validation when searching by department for admin user", async () => {
  const department = await prismaClient.department.findUnique({
    where: { code: "62" },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  const candidacy = await createCandidacyHelper({
    candidacyArgs: { departmentId: department.id },
    candidacyActiveStatus: "DOSSIER_DE_VALIDATION_ENVOYE",
  });

  await createDossierDeValidationHelper({
    candidacyId: candidacy.id,
    decision: "PENDING",
  });

  const ddvResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "dossierDeValidation_getDossiersDeValidation",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: "pas-de-calais",
      },
    },
  });
  expect(ddvResp.statusCode).toEqual(200);
  const ddvObj = ddvResp.json();
  expect(
    ddvObj.data.dossierDeValidation_getDossiersDeValidation.rows.length,
  ).toEqual(1);
});
