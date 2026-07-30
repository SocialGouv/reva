import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED as UNAUTHENTICATED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Verrouille aussi la seule règle métier du resolver : le footer réservé à l'admin.

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const call = (candidacyId: string, authorization?: string) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "query",
      endpoint: "candidacyMenu_getCandidacyMenu",
      arguments: { candidacyId },
      returnFields: "{ menuHeader { label } menuFooter { label } }",
    },
  });

describe("candidacy-menu - autorisation des resolvers", () => {
  describe("candidacyMenu_getCandidacyMenu (admin ou AAP rattaché)", () => {
    test("admin : autorisé, le footer contient le journal des actions", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(candidacy.id, asRole("admin"));

      expect(resp.json()).not.toHaveProperty("errors");
      const menu = resp.json().data.candidacyMenu_getCandidacyMenu;
      expect(menu.menuFooter).toEqual([{ label: "Journal des actions" }]);
    });

    test("l'AAP rattaché à la candidature : autorisé, le footer est vide", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(
        candidacy.id,
        asRole(
          "manage_candidacy",
          candidacy.organism!.organismOnAccounts[0].account.keycloakId,
        ),
      );

      expect(resp.json()).not.toHaveProperty("errors");
      const menu = resp.json().data.candidacyMenu_getCandidacyMenu;
      expect(menu.menuHeader.length).toBeGreaterThan(0);
      expect(menu.menuFooter).toEqual([]);
    });

    test("un AAP NON rattaché à la candidature : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const autreCandidacy = await createCandidacyHelper();
      const resp = await call(
        candidacy.id,
        asRole(
          "manage_candidacy",
          autreCandidacy.organism!.organismOnAccounts[0].account.keycloakId,
        ),
      );
      expect(resp.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_MANAGE,
      );
    });

    test("un candidat : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(
        candidacy.id,
        asRole("candidate", candidacy.candidate!.keycloakId),
      );
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(candidacy.id);
      expect(resp.json().errors[0].message).toBe(UNAUTHENTICATED);
    });
  });
});
