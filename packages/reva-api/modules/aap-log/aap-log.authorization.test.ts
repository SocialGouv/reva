import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED as UNAUTHENTICATED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import { logAAPAuditEvent } from "./features/logAAPAuditEvent";

// Couplage assumé : `MaisonMereAAP.aapLogs` n'a aucun parent atteignable dans son propre
// module, donc cette suite entre par la query du module organism et dépend de sa policy
// `isAdminOrGestionnaireOfMaisonMereAAP`. Aucun autre point d'entrée ne porte un argument
// `maisonMereAAPId`.

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const call = (maisonMereAAPId: string, authorization?: string) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "query",
      endpoint: "organism_getMaisonMereAAPById",
      arguments: { maisonMereAAPId },
      returnFields: "{ aapLogs { id message details } }",
    },
  });

describe("aap-log - autorisation des resolvers", () => {
  describe("MaisonMereAAP.aapLogs (admin)", () => {
    test("admin : autorisé, le log seedé revient avec message et details", async () => {
      const maisonMereAAP = await createMaisonMereAapHelper();
      await logAAPAuditEvent({
        maisonMereAAPId: maisonMereAAP.id,
        userInfo: {
          userKeycloakId: faker.string.uuid(),
          userEmail: faker.internet.email(),
          userRoles: ["admin"],
        },
        eventType: "MAISON_MERE_ORGANISMS_ISACTIVE_UPDATED",
        details: { isActive: true },
      });

      const resp = await call(maisonMereAAP.id, asRole("admin"));

      expect(resp.json()).not.toHaveProperty("errors");
      const aapLogs = resp.json().data.organism_getMaisonMereAAPById.aapLogs;
      expect(aapLogs).toHaveLength(1);
      // Les feuilles `message` / `details` sont publiques : seule la policy du
      // parent les protège.
      expect(aapLogs[0].message).toBeTruthy();
      expect(aapLogs[0].details).toBeTruthy();
    });

    test("le gestionnaire de la maison mère : le parent passe, aapLogs est refusé", async () => {
      const maisonMereAAP = await createMaisonMereAapHelper();
      const resp = await call(
        maisonMereAAP.id,
        asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
      );
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const maisonMereAAP = await createMaisonMereAapHelper();
      const resp = await call(maisonMereAAP.id);
      expect(resp.json().errors[0].message).toBe(UNAUTHENTICATED);
    });
  });
});
