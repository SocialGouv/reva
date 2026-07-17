import { faker } from "@faker-js/faker";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Autorisation de chaque resolver organism : qui passe, qui est refusé.

const NOT_AUTHORIZED = "You are not authorized!";
const UNAUTHENTICATED = "Votre session a expiré, veuillez vous reconnecter.";

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

describe("organism - autorisation des resolvers", () => {
  describe("organism_getMaisonMereAAPs (admin)", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "organism_getMaisonMereAAPs",
          arguments: { offset: 0 },
          returnFields: "{ rows { id } }",
        },
      });

    test("admin : autorisé", async () => {
      const resp = await call(asRole("admin"));
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("candidate : refusé", async () => {
      const resp = await call(asRole("candidate"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe(UNAUTHENTICATED);
    });
  });

  describe("organism_updateFermePourAbsenceOuConges (owner ou gestionnaire ou admin)", () => {
    const call = (organismId: string, authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "mutation",
          endpoint: "organism_updateFermePourAbsenceOuConges",
          arguments: { organismId, fermePourAbsenceOuConges: true },
          returnFields: "{ id fermePourAbsenceOuConges }",
        },
      });

    test("l'AAP rattaché à l'organisme : autorisé", async () => {
      const organism = await createOrganismHelper();
      const resp = await call(
        organism.id,
        asRole(
          "manage_candidacy",
          organism.organismOnAccounts[0].account.keycloakId,
        ),
      );
      expect(resp.json()).not.toHaveProperty("errors");
      expect(
        resp.json().data.organism_updateFermePourAbsenceOuConges
          .fermePourAbsenceOuConges,
      ).toBe(true);
    });

    // L'admin doit avoir un compte : la règle (inline hier, middleware aujourd'hui) résout
    // l'appelant en compte avant le bypass admin.
    test("l'admin : autorisé", async () => {
      const organism = await createOrganismHelper();
      const admin = await createAccountHelper();
      const resp = await call(organism.id, asRole("admin", admin.keycloakId));
      expect(resp.json()).not.toHaveProperty("errors");
    });

    // Le candidate a un compte : le refus doit venir de l'absence de rattachement à
    // l'organisme, pas de l'absence de compte (qui refuserait n'importe qui).
    test("un candidate non rattaché : refusé", async () => {
      const organism = await createOrganismHelper();
      const candidate = await createAccountHelper();
      const resp = await call(
        organism.id,
        asRole("candidate", candidate.keycloakId),
      );
      expect(resp.json().errors[0].message).toBe("Utilisateur non autorisé");
    });
  });
});
