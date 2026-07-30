import { faker } from "@faker-js/faker";

import { NOT_AUTHORIZED } from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import { logCandidacyAuditEvent } from "./features/logCandidacyAuditEvent";

// `Candidacy.candidacyLogs` est la seule barrière sur le journal d'audit : la query parente
// `getCandidacyById` est ouverte à l'AAP rattaché, au candidat propriétaire et au
// certificateur. On entre par elle pour vérifier que le refus vient bien du champ.

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
      endpoint: "getCandidacyById",
      arguments: { id: candidacyId },
      returnFields: "{ candidacyLogs { id message details } }",
    },
  });

describe("candidacy-log - autorisation des resolvers", () => {
  describe("Candidacy.candidacyLogs (admin)", () => {
    test("admin : autorisé, le log seedé revient avec message et details", async () => {
      const candidacy = await createCandidacyHelper();
      await logCandidacyAuditEvent({
        candidacyId: candidacy.id,
        userKeycloakId: faker.string.uuid(),
        userEmail: faker.internet.email(),
        userRoles: ["admin"],
        eventType: "ADMIN_CUSTOM_ACTION",
        details: { message: "Action manuelle de l'équipe" },
      });

      const resp = await call(candidacy.id, asRole("admin"));

      expect(resp.json()).not.toHaveProperty("errors");
      const candidacyLogs = resp.json().data.getCandidacyById.candidacyLogs;
      expect(candidacyLogs).toHaveLength(1);
      // Les feuilles `message` / `details` sont publiques : seule la policy du
      // parent les protège.
      expect(candidacyLogs[0].message).toBeTruthy();
      expect(candidacyLogs[0].details).toBeTruthy();
    });

    test("l'AAP rattaché à la candidature : le parent passe, candidacyLogs est refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(
        candidacy.id,
        asRole(
          "manage_candidacy",
          candidacy.organism!.organismOnAccounts[0].account.keycloakId,
        ),
      );
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("le candidat propriétaire : le parent passe, candidacyLogs est refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(
        candidacy.id,
        asRole("candidate", candidacy.candidate!.keycloakId),
      );
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    // On verrouille le refus, pas le libellé : `getCandidacyById` est policé par
    // `[canAccessCandidacy]` seul, qui déréférence `context.auth.userInfo` sans garde et
    // remonte donc une TypeError interne. Anomalie du module candidacy, hors périmètre.
    test("non authentifié : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(candidacy.id);
      expect(resp.json().errors).toHaveLength(1);
    });
  });
});
