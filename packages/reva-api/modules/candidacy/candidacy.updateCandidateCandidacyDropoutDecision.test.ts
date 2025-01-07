import { startOfDay, startOfToday } from "date-fns";
import { buildApp } from "../../infra/server/app";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyDropOutHelper } from "../../test/helpers/entities/create-candidacy-drop-out-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import keycloakPluginMock from "../../test/mocks/keycloak-plugin.mock";
import * as SendCandidacyDropOutConfirmedEmailToAapModule from "./mails/sendCandidacyDropOutConfirmedEmailToAap";
import * as SendCandidacyDropOutConfirmedEmailToCandidateModule from "./mails/sendCandidacyDropOutConfirmedEmailToCandidate";

beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;
});

afterEach(async () => {
  await clearDatabase();
});

describe("candidate drop out decision", () => {
  test("should mark the drop out as confirmed when the candidate confirms it and sent an email to the aap", async () => {
    const sendCandidacyDropOutConfirmedEmailToAapSpy = jest
      .spyOn(
        SendCandidacyDropOutConfirmedEmailToAapModule,
        "sendCandidacyDropOutConfirmedEmailToAap",
      )
      .mockImplementation(() => Promise.resolve(""));

    const sendCandidacyDropOutConfirmedEmailToCandidateSpy = jest
      .spyOn(
        SendCandidacyDropOutConfirmedEmailToCandidateModule,
        "sendCandidacyDropOutConfirmedEmailToCandidate",
      )
      .mockImplementation(() => Promise.resolve(""));

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
    expect(sendCandidacyDropOutConfirmedEmailToAapSpy).toHaveBeenCalledWith({
      aapEmail:
        candidacyDropOut.candidacy.organism?.organismInformationsCommerciales
          ?.emailContact,
      aapLabel:
        candidacyDropOut.candidacy.organism?.organismInformationsCommerciales
          ?.nom,
      candidateFullName: `${candidacyDropOut.candidacy.candidate?.firstname} ${candidacyDropOut.candidacy.candidate?.lastname}`,
    });

    expect(
      sendCandidacyDropOutConfirmedEmailToCandidateSpy,
    ).toHaveBeenCalledWith({
      candidateEmail: candidacyDropOut.candidacy.candidate?.email,
      candidateFullName: `${candidacyDropOut.candidacy.candidate?.firstname} ${candidacyDropOut.candidacy.candidate?.lastname}`,
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
        returnFields:
          "{lastActivityDate candidacyDropOut { dropOutConfirmedByCandidate } }",
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
    expect(
      startOfDay(
        obj.data.candidacy_updateCandidateCandidacyDropoutDecision
          .lastActivityDate,
      ),
    ).toEqual(startOfToday());
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
