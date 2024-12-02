/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { createJuryHelper } from "../../test/helpers/entities/create-jury-helper";
import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

let juries: Awaited<ReturnType<typeof createJuryHelper>>[] = [];

beforeAll(async () => {
  const tomorrow = new Date("2025-01-01");
  // tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date("2024-11-31");
  // yesterday.setDate(yesterday.getDate() - 1);

  juries = await Promise.all([
    createJuryHelper({
      dateOfSession: tomorrow,
    }),
    createJuryHelper({
      dateOfSession: tomorrow,
    }),

    createJuryHelper({
      dateOfSession: tomorrow,
    }),

    createJuryHelper({
      dateOfSession: tomorrow,
      isActive: false,
    }),

    createJuryHelper({
      result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
      dateOfResult: new Date(),
      dateOfSession: yesterday,
    }),

    createJuryHelper({
      result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
      dateOfResult: new Date(),
      dateOfSession: yesterday,
    }),
    // createJuryHelper({
    //   result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    //   dateOfResult: new Date(),
    //   isActive: false,
    // }),
  ]);
});

afterAll(async () => {
  await prismaClient.jury.deleteMany({});
});

test("should count 1 jury by email for admin user", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_juryCountByCategory",
      returnFields: "{SCHEDULED,PASSED}",
      arguments: {
        searchFilter: juries[0].candidacy.candidate?.email,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.jury_juryCountByCategory).toMatchObject({
    SCHEDULED: 1,
    PASSED: 0,
  });

  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter: juries[0].candidacy.candidate?.email,
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows[0].id).toEqual(juries[0].id);
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(1);
});

test("should count 1 PENDING jury by name for admin user", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_juryCountByCategory",
      returnFields: "{SCHEDULED,PASSED}",
      arguments: {
        searchFilter:
          juries[0].candidacy.candidate?.firstname +
          " " +
          juries[0].candidacy.candidate?.lastname,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.jury_juryCountByCategory).toMatchObject({
    SCHEDULED: 1,
    PASSED: 0,
  });
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter:
          juries[0].candidacy.candidate?.firstname +
          " " +
          juries[0].candidacy.candidate?.lastname,
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows[0].id).toEqual(juries[0].id);
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(1);
});

test("should count active juries by status for admin user searched by rncp type diplome", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_juryCountByCategory",
      returnFields: "{SCsppppppppppppppppppppppppppppppppppppjurjury../../
  cloconsole.log('first', first)oobbjj;""SSSSCCCCHEDULED,PASSED}",
      arguments: {
        searchFilter: juries[0].candidacy.certification?.rncpTypeDiplome,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.jury_juryCountByCategory).toMatchObject({
    SCHEDULED: 3,
    PASSED: 2,
  });

  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter: juries[0].candidacy.certification?.rncpTypeDiplome,
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const feasibilityObj = juryResp.json();
  expect(feasibilityObj.data.jury_getJuries.rows.length).toEqual(5);
});

test("should count all juries by status for admin user", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_juryCountByCategory",
      returnFields: "{SCHEDULED,PASSED}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.jury_juryCountByCategory).toMatchObject({
    SCHEDULED: 3,
    PASSED: 2,
  });

  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(5);
});

/** ----------------------------------------------------------------- */
/**                     TEST SCHEDULED JURIES FILTER                     */
/** ----------------------------------------------------------------- */

test("should get 1 SCHEDULED jury by email for admin user", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: juries[0].candidacy.candidate?.email,
        categoryFilter: "SCHEDULED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows[0].id).toEqual(juries[0].id);
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(1);
});

test("should get 1 SCHEDULED jury by name for admin user", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          juries[0].candidacy.candidate?.firstname +
          " " +
          juries[0].candidacy.candidate?.lastname,
        categoryFilter: "SCHEDULED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows[0].id).toEqual(juries[0].id);
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(1);
});

test("should get SCHEDULED juries by status for admin user searched by rncp type diplome", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: juries[0].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "SCHEDULED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const feasibilityObj = juryResp.json();
  expect(feasibilityObj.data.jury_getJuries.rows.length).toEqual(3);
});

test("should get all (3) SCHEDULED juries by status for admin user", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "SCHEDULED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(3);
});

// /** ----------------------------------------------------------------- */
// /**                     TEST PASSED FILES FILTER                  */
// /** ----------------------------------------------------------------- */

test("should get 1 PASSED jury by email for admin user", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: juries[4].candidacy.candidate?.email,
        categoryFilter: "PASSED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows[0].id).toEqual(juries[4].id);
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(1);
});

test("should get 1 PASSED jury by name for admin user", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          juries[4].candidacy.candidate?.firstname +
          " " +
          juries[4].candidacy.candidate?.lastname,
        categoryFilter: "PASSED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows[0].id).toEqual(juries[4].id);
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(1);
});

test("should get PASSED juries by status for admin user searched by rncp type diplome", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: juries[4].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "PASSED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const feasibilityObj = juryResp.json();
  expect(feasibilityObj.data.jury_getJuries.rows.length).toEqual(2);
});

test("should get all (2) PASSED juries by status for admin user", async () => {
  const juryResp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "jury_getJuries",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "PASSED",
      },
    },
  });
  expect(juryResp.statusCode).toEqual(200);
  const juryObj = juryResp.json();
  expect(juryObj.data.jury_getJuries.rows.length).toEqual(2);
});
