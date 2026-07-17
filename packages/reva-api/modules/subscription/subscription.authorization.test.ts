import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Autorisation des resolvers subscription.
// Les queries et les mutations de validation/rejet sont réservées à l'admin:
// on prouve qu'un candidat est refusé sur chacune. La création de demande et les
// champs SubscriptionRequest.* sont volontairement publics (isAnyone): aucun refus
// à prouver, l'accès reste limité à la demande que l'appelant vient de créer.

const asRole = (role: KeyCloakUserRole) =>
  authorizationHeaderForUser({ role, keycloakId: faker.string.uuid() });

describe("subscription - autorisation des resolvers", () => {
  describe("subscription_getSubscriptionRequests (admin)", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "subscription_getSubscriptionRequests",
          returnFields: "{ __typename }",
        },
      });

    test("un candidat est refusé", async () => {
      const resp = await call(asRole("candidate"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("un appelant non authentifié est refusé", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  test("subscription_getSubscriptionRequest refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "query",
        endpoint: "subscription_getSubscriptionRequest",
        arguments: { subscriptionRequestId: faker.string.uuid() },
        returnFields: "{ __typename }",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });

  test("subscription_getSubscriptionCountByStatus refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "query",
        endpoint: "subscription_getSubscriptionCountByStatus",
        returnFields: "{ __typename }",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });

  test("subscription_validateSubscriptionRequest refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "mutation",
        endpoint: "subscription_validateSubscriptionRequest",
        arguments: { subscriptionRequestId: faker.string.uuid() },
        returnFields: "",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });

  test("subscription_rejectSubscriptionRequest refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "mutation",
        endpoint: "subscription_rejectSubscriptionRequest",
        arguments: {
          subscriptionRequestId: faker.string.uuid(),
          reason: "raison de test",
        },
        returnFields: "",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });
});
