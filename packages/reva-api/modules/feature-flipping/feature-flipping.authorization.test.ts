import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED as UNAUTHENTICATED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createFeatureHelper } from "@/test/helpers/entities/create-feature-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Autorisation de chaque resolver feature-flipping : qui passe, qui est refusé.

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

describe("feature-flipping - autorisation des resolvers", () => {
  describe("activeFeaturesForConnectedUser (public)", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "activeFeaturesForConnectedUser",
          returnFields: "",
        },
      });

    // Contrat public consommé sans en-tête d'autorisation par reva-website.
    test("non authentifié : autorisé", async () => {
      const resp = await call();
      expect(resp.json()).not.toHaveProperty("errors");
      expect(
        Array.isArray(resp.json().data.activeFeaturesForConnectedUser),
      ).toBe(true);
    });

    test("candidat : autorisé", async () => {
      const resp = await call(asRole("candidate"));
      expect(resp.json()).not.toHaveProperty("errors");
    });
  });

  describe("featureFlipping_getFeatures (admin)", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "featureFlipping_getFeatures",
          returnFields: "{ key isActive }",
        },
      });

    test("admin : autorisé", async () => {
      const feature = await createFeatureHelper({ args: { isActive: false } });
      const resp = await call(asRole("admin"));
      expect(resp.json()).not.toHaveProperty("errors");
      expect(resp.json().data.featureFlipping_getFeatures).toContainEqual({
        key: feature.key,
        isActive: false,
      });
    });

    test("AAP : refusé", async () => {
      const resp = await call(asRole("manage_candidacy"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe(UNAUTHENTICATED);
    });
  });

  describe("featureFlipping_toggleFeature (admin)", () => {
    // Le refus doit intervenir avant la mutation : on vérifie aussi la ligne en base.
    test("AAP : refusé, la feature reste inchangée", async () => {
      const feature = await createFeatureHelper({ args: { isActive: false } });
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("manage_candidacy"),
        payload: {
          requestType: "mutation",
          endpoint: "featureFlipping_toggleFeature",
          arguments: { featureKey: feature.key, isActive: true },
          returnFields: "{ key isActive }",
        },
      });

      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
      const featureAfter = await prismaClient.feature.findUnique({
        where: { key: feature.key },
      });
      expect(featureAfter?.isActive).toBe(false);
    });
  });
});
