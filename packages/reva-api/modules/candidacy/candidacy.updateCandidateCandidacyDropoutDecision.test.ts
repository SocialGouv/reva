import { buildApp } from "../../infra/server/app";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyDropOutHelper } from "../../test/helpers/entities/create-candidacy-drop-out-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import keycloakPluginMock from "../../test/mocks/keycloak-plugin.mock";

beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;
});

afterEach(async () => {
  await clearDatabase();
});

describe("candidate drop out decision", () => {
  test("should mark the drop out as confirmed when the candidate confirms it", async () => {
    const candidacyDropOut = await createCandidacyDropOutHelper();
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidacyDropOut.candidacy.candidate?.keycloakId || "",
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacyDropOut.candidacyId,
          dropOutConfirmed: true,
        },
        endpoint: "candidacy_updateCandidateCandidacyDropoutDecision",
        returnFields: "{  candidacyDropOut { dropOutConfirmedByCandidate } }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");

    const obj = resp.json();

    expect(
      obj.data.candidacy_updateCandidateCandidacyDropoutDecision,
    ).toMatchObject({
      candidacyDropOut: { dropOutConfirmedByCandidate: true },
    });
  });
  test("should delete the candidacy drop out when  the candidate cancel the drop out", async () => {
    const candidacyDropOut = await createCandidacyDropOutHelper();
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidacyDropOut.candidacy.candidate?.keycloakId || "",
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacyDropOut.candidacyId,
          dropOutConfirmed: false,
        },
        endpoint: "candidacy_updateCandidateCandidacyDropoutDecision",
        returnFields: "{  candidacyDropOut { dropOutConfirmedByCandidate } }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");

    const obj = resp.json();

    expect(
      obj.data.candidacy_updateCandidateCandidacyDropoutDecision,
    ).toMatchObject({
      candidacyDropOut: null,
    });
  });
  test("should not be allowed to cancel a drop out if it has already been confirmed", async () => {
    const candidacyDropOut = await createCandidacyDropOutHelper({
      dropOutConfirmedByCandidate: true,
    });
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidacyDropOut.candidacy.candidate?.keycloakId || "",
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacyDropOut.candidacyId,
          dropOutConfirmed: false,
        },
        endpoint: "candidacy_updateCandidateCandidacyDropoutDecision",
        returnFields: "{  candidacyDropOut { dropOutConfirmedByCandidate } }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).toHaveProperty("errors");

    const obj = resp.json();
    expect(obj.errors[0].message).toBe(
      "La décision d'abandon a déjà été confirmée par le candidat",
    );
  });
});
