import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Autorisation de chaque resolver account : qui passe, qui est refusé.
// Un cas "autorisé" est prouvé par un échec de validation métier AVANT tout appel Keycloak
// (message métier != message d'autorisation) ; un cas "public" par un appel non authentifié.

const asRole = (role: KeyCloakUserRole) =>
  authorizationHeaderForUser({ role, keycloakId: faker.string.uuid() });

describe("account - autorisation des resolvers", () => {
  // --- Resolvers réservés à l'admin (isAdmin) ---

  describe("account_getImpersonateUrl (admin)", () => {
    // `candidacyId` seul (sans accountId/candidateId) : la feature renvoie null sans Keycloak.
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "account_getImpersonateUrl",
          arguments: { input: { candidacyId: faker.string.uuid() } },
          returnFields: "",
        },
      });

    test("admin : autorisé (retourne null, aucune erreur)", async () => {
      const resp = await call(asRole("admin"));
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).not.toHaveProperty("errors");
      expect(resp.json().data.account_getImpersonateUrl).toBeNull();
    });

    test("non-admin : refusé", async () => {
      const resp = await call(asRole("candidate"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("account_createAccount (admin)", () => {
    // group certification_authority sans certificationAuthorityId : validation métier avant Keycloak.
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "mutation",
          endpoint: "account_createAccount",
          arguments: {
            account: {
              email: faker.internet.email(),
              username: faker.internet.username(),
              group: "certification_authority",
            },
          },
          enumFields: ["group"],
          returnFields: "{ id }",
        },
      });

    test("admin : autorisé (échoue sur la validation métier)", async () => {
      const resp = await call(asRole("admin"));
      expect(resp.json().errors[0].message).toContain(
        "certificationAuthorityId est obligatoire",
      );
    });

    test("non-admin : refusé", async () => {
      const resp = await call(asRole("candidate"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  // --- Resolvers publics (isAnyone) : un appel non authentifié atteint la feature ---

  test("account_getAccountForConnectedUser : public (retourne null, aucune erreur)", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      payload: {
        requestType: "query",
        endpoint: "account_getAccountForConnectedUser",
        returnFields: "{ id }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
  });

  test("account_loginWithCredentials : public (atteint la feature)", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      payload: {
        requestType: "mutation",
        endpoint: "account_loginWithCredentials",
        arguments: {
          email: faker.internet.email(),
          password: "x",
          clientApp: "REVA_ADMIN",
        },
        enumFields: ["clientApp"],
        returnFields: "{ requiresOtp }",
      },
    });
    expect(resp.json().errors[0].message).toBe("Compte non trouvé");
  });

  test("account_verifyOtpChallenge : public (atteint la feature)", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      payload: {
        requestType: "mutation",
        endpoint: "account_verifyOtpChallenge",
        arguments: { challengeToken: "invalide", otp: "000000" },
        returnFields: "{ account { id } }",
      },
    });
    expect(resp.json().errors[0].message).toBe(
      "Session de vérification expirée, veuillez vous reconnecter",
    );
  });

  test("account_sendForgotPasswordEmail : public (aucune erreur)", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      payload: {
        requestType: "mutation",
        endpoint: "account_sendForgotPasswordEmail",
        arguments: { email: faker.internet.email(), clientApp: "REVA_ADMIN" },
        enumFields: ["clientApp"],
        returnFields: "",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
  });

  test("account_resetPassword : public (atteint la feature)", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      payload: {
        requestType: "mutation",
        endpoint: "account_resetPassword",
        arguments: { token: "invalide", password: "x" },
        returnFields: "",
      },
    });
    // token invalide -> erreur de décodage JWT, jamais un refus d'autorisation.
    const message = resp.json().errors[0].message;
    expect(message).not.toBe(NOT_AUTHORIZED);
    expect(message).not.toBe(SESSION_EXPIRED);
  });

  test("account_resendEmailOtp : public (atteint la feature)", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      payload: {
        requestType: "mutation",
        endpoint: "account_resendEmailOtp",
        arguments: { email: faker.internet.email() },
        returnFields: "",
      },
    });
    expect(resp.json().errors[0].message).toBe("Compte non trouvé");
  });
});
