import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import { archiveCandidacy } from "../candidacy/features/archiveCandidacy";

let feasibilities: Awaited<
  ReturnType<typeof createFeasibilityUploadedPdfHelper>
>[] = [];
let candidacyToDropOut: Awaited<
  ReturnType<typeof createFeasibilityUploadedPdfHelper>
>;
let candidacyToArchive: Awaited<
  ReturnType<typeof createFeasibilityUploadedPdfHelper>
>;

beforeEach(async () => {
  feasibilities = await Promise.all([
    createFeasibilityUploadedPdfHelper({
      decision: "PENDING",
    }),
    createFeasibilityUploadedPdfHelper({
      decision: "PENDING",
    }),

    createFeasibilityUploadedPdfHelper({
      decision: "ADMISSIBLE",
    }),

    createFeasibilityUploadedPdfHelper({
      decision: "REJECTED",
    }),

    createFeasibilityUploadedPdfHelper({
      decision: "INCOMPLETE",
    }),

    createFeasibilityUploadedPdfHelper({
      decision: "COMPLETE",
    }),
  ]);
  await createCandidacyHelper({
    candidacyActiveStatus: "ARCHIVE",
  });
  candidacyToDropOut = await createFeasibilityUploadedPdfHelper(
    {},
    "DOSSIER_FAISABILITE_COMPLET",
  );
  await createCandidacyDropOutHelper({
    candidacyId: candidacyToDropOut.candidacy.id,
  });

  candidacyToArchive = await createFeasibilityUploadedPdfHelper(
    {},
    "DOSSIER_FAISABILITE_COMPLET",
  );
  await archiveCandidacy({
    candidacyId: candidacyToArchive.candidacy.id,
    archivingReason: "INACTIVITE_CANDIDAT",
  });
});

test("should count 1 feasibility by email for admin user", async () => {
  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields:
        "{ALL,PENDING,ADMISSIBLE,REJECTED,COMPLETE,INCOMPLETE,ARCHIVED,DROPPED_OUT}",
      arguments: {
        searchFilter: feasibilities[0].candidacy.candidate?.email,
      },
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
    COMPLETE: 0,
    ARCHIVED: 0,
    DROPPED_OUT: 0,
  });

  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter: feasibilities[0].candidacy.candidate?.email,
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[0].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should count 1 PENDING feasibility by name for admin user", async () => {
  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields:
        "{ALL,PENDING,ADMISSIBLE,REJECTED,COMPLETE,INCOMPLETE,ARCHIVED,DROPPED_OUT}",
      arguments: {
        searchFilter:
          feasibilities[0].candidacy.candidate?.firstname +
          " " +
          feasibilities[0].candidacy.candidate?.lastname,
      },
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
    COMPLETE: 0,
    ARCHIVED: 0,
    DROPPED_OUT: 0,
  });
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter:
          feasibilities[0].candidacy.candidate?.firstname +
          " " +
          feasibilities[0].candidacy.candidate?.lastname,
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[0].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should count active feasibilities by status for admin user searched by rncp type diplome", async () => {
  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields:
        "{ALL,PENDING,ADMISSIBLE,REJECTED,COMPLETE,INCOMPLETE,ARCHIVED,DROPPED_OUT}",
      arguments: {
        searchFilter: feasibilities[0].candidacy.certification?.rncpTypeDiplome,
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 5,
    PENDING: 2,
    ADMISSIBLE: 1,
    INCOMPLETE: 1,
    REJECTED: 1,
    COMPLETE: 1,
    ARCHIVED: 1,
    DROPPED_OUT: 1,
  });

  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      arguments: {
        searchFilter: feasibilities[0].candidacy.certification?.rncpTypeDiplome,
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(5);
});

test("should count all feasibilities by status for admin user", async () => {
  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields:
        "{ALL,PENDING,ADMISSIBLE,REJECTED,COMPLETE,INCOMPLETE,ARCHIVED,DROPPED_OUT}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 5,
    PENDING: 2,
    ADMISSIBLE: 1,
    INCOMPLETE: 1,
    REJECTED: 1,
    COMPLETE: 1,
    ARCHIVED: 1,
    DROPPED_OUT: 1,
  });

  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(5);
});

/** ----------------------------------------------------------------- */
/**                     TEST PENDING FILES FILTER                     */
/** ----------------------------------------------------------------- */

test("should get 1 PENDING feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[0].candidacy.candidate?.email,
        categoryFilter: "PENDING",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[0].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 PENDING feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          feasibilities[0].candidacy.candidate?.firstname +
          " " +
          feasibilities[0].candidacy.candidate?.lastname,
        categoryFilter: "PENDING",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[0].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 2 PENDING feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[0].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "PENDING",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(2);
});

test("should get all (2) PENDING feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "PENDING",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(2);
});

/** ----------------------------------------------------------------- */
/**                     TEST ADMISSIBLE FILES FILTER                  */
/** ----------------------------------------------------------------- */

test("should get 1 ADMISSIBLE feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[2].candidacy.candidate?.email,
        categoryFilter: "ADMISSIBLE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[2].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 ADMISSIBLE feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          feasibilities[2].candidacy.candidate?.firstname +
          " " +
          feasibilities[2].candidacy.candidate?.lastname,
        categoryFilter: "ADMISSIBLE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[2].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get ADMISSIBLE feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[2].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "ADMISSIBLE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get all ADMISSIBLE feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "ADMISSIBLE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

/** ----------------------------------------------------------------- */
/**                     TEST REJECTED FILES FILTER                    */
/** ----------------------------------------------------------------- */

test("should get 1 REJECTED feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[3].candidacy.candidate?.email,
        categoryFilter: "REJECTED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[3].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 REJECTED feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          feasibilities[3].candidacy.candidate?.firstname +
          " " +
          feasibilities[3].candidacy.candidate?.lastname,
        categoryFilter: "REJECTED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[3].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get REJECTED feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[3].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "REJECTED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get all REJECTED feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "REJECTED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

/** ----------------------------------------------------------------- */
/**                     TEST INCOMPLETE FILES FILTER                  */
/** ----------------------------------------------------------------- */

test("should get 1 INCOMPLETE feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[4].candidacy.candidate?.email,
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[4].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 INCOMPLETE feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          feasibilities[4].candidacy.candidate?.firstname +
          " " +
          feasibilities[4].candidacy.candidate?.lastname,
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[4].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get INCOMPLETE feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[4].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get all INCOMPLETE feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "INCOMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

/** ----------------------------------------------------------------- */
/**                     TEST COMPLETE FILES FILTER                    */
/** ----------------------------------------------------------------- */

test("should get 1 COMPLETE feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[5].candidacy.candidate?.email,
        categoryFilter: "COMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[5].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 COMPLETE feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          feasibilities[5].candidacy.candidate?.firstname +
          " " +
          feasibilities[5].candidacy.candidate?.lastname,
        categoryFilter: "COMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    feasibilities[5].id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get COMPLETE feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: feasibilities[5].candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "COMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get all COMPLETE feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "COMPLETE",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

/** ----------------------------------------------------------------- */
/**                     TEST ARCHIVED FILES FILTER                    */
/** ----------------------------------------------------------------- */

test("should get 1 ARCHIVED feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: candidacyToArchive.candidacy.candidate?.email,
        categoryFilter: "ARCHIVED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    candidacyToArchive.id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 ARCHIVED feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          candidacyToArchive.candidacy.candidate?.firstname +
          " " +
          candidacyToArchive.candidacy.candidate?.lastname,
        categoryFilter: "ARCHIVED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    candidacyToArchive.id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get ARCHIVED feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          candidacyToArchive.candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "ARCHIVED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get all ARCHIVED feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "ARCHIVED",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

/** ----------------------------------------------------------------- */
/**                     TEST DROPPED_OUT FILES FILTER                 */
/** ----------------------------------------------------------------- */

test("should get 1 DROPPED_OUT feasibility by email for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter: candidacyToDropOut.candidacy.candidate?.email,
        categoryFilter: "DROPPED_OUT",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    candidacyToDropOut.id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get 1 DROPPED_OUT feasibility by name for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          candidacyToDropOut.candidacy.candidate?.firstname +
          " " +
          candidacyToDropOut.candidacy.candidate?.lastname,
        categoryFilter: "DROPPED_OUT",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows[0].id).toEqual(
    candidacyToDropOut.id,
  );
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get DROPPED_OUT feasibilities for admin user searched by rncp type diplome", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        searchFilter:
          candidacyToDropOut.candidacy.certification?.rncpTypeDiplome,
        categoryFilter: "DROPPED_OUT",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

test("should get all DROPPED_OUT feasibilities for admin user", async () => {
  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      enumFields: ["categoryFilter"],
      arguments: {
        categoryFilter: "DROPPED_OUT",
      },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});

// Search by deparment label
test("should count 1 feasibility when searching by department for admin user", async () => {
  const department = await prismaClient.department.findUnique({
    where: { code: "62" },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  const candidate = await createCandidateHelper({
    departmentId: department.id,
  });

  const candidacy = await createCandidacyHelper({
    candidacyArgs: { candidateId: candidate.id },
    candidacyActiveStatus: "DOSSIER_FAISABILITE_ENVOYE",
  });

  await createFeasibilityUploadedPdfHelper({
    candidacyId: candidacy.id,
    decision: "ADMISSIBLE",
  });

  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilityCountByCategory",
      returnFields:
        "{ALL,PENDING,ADMISSIBLE,REJECTED,COMPLETE,INCOMPLETE,ARCHIVED,DROPPED_OUT}",
      arguments: {
        searchFilter: "pas-de-calais",
      },
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.feasibilityCountByCategory).toMatchObject({
    ALL: 1,
    PENDING: 0,
    ADMISSIBLE: 1,
    REJECTED: 0,
    INCOMPLETE: 0,
    COMPLETE: 0,
    ARCHIVED: 0,
    DROPPED_OUT: 0,
  });
});

test("should return 1 feasibility when searching by department for admin user", async () => {
  const department = await prismaClient.department.findUnique({
    where: { code: "62" },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  const candidate = await createCandidateHelper({
    departmentId: department.id,
  });

  const candidacy = await createCandidacyHelper({
    candidacyArgs: { candidateId: candidate.id },
    candidacyActiveStatus: "DOSSIER_FAISABILITE_ENVOYE",
  });

  await createFeasibilityUploadedPdfHelper({
    candidacyId: candidacy.id,
    decision: "ADMISSIBLE",
  });

  const feasibilitiesResp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "feasibilities",
      returnFields: "{rows{id}}",
      arguments: { searchFilter: "pas-de-calais" },
    },
  });
  expect(feasibilitiesResp.statusCode).toEqual(200);
  const feasibilityObj = feasibilitiesResp.json();
  expect(feasibilityObj.data.feasibilities.rows.length).toEqual(1);
});
