import { faker } from "@faker-js/faker";

import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const query = ({
  endpoint,
  authorization,
  arguments: queryArguments,
  returnFields,
}: {
  endpoint: string;
  authorization?: string;
  arguments?: Record<string, unknown>;
  returnFields: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "query",
      endpoint,
      arguments: queryArguments,
      returnFields,
    },
  });

describe("candidacy resolver read authorization", () => {
  describe("getCandidacies", () => {
    test("allows an admin to list every candidacy", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await query({
        endpoint: "getCandidacies",
        authorization: asRole("admin"),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.getCandidacies.rows).toContainEqual({
        id: candidacy.id,
      });
    });

    test("allows the maison mere manager to list candidacies associated to its maison mere", async () => {
      const organism = await createOrganismHelper();
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { organismId: organism.id },
      });

      const response = await query({
        endpoint: "getCandidacies",
        authorization: asRole(
          "gestion_maison_mere_aap",
          organism.maisonMereAAP!.gestionnaire.keycloakId,
        ),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.getCandidacies.rows).toContainEqual({
        id: candidacy.id,
      });
    });

    test.each<KeyCloakUserRole>([
      "candidate",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await query({
        endpoint: "getCandidacies",
        authorization: asRole(role),
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await query({
        endpoint: "getCandidacies",
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  test("allows an unauthenticated user to request an organism search for a candidacy", async () => {
    const response = await query({
      endpoint: "getRandomOrganismsForCandidacy",
      arguments: { candidacyId: faker.string.uuid() },
      returnFields: "{ totalRows }",
    });

    expect(response.json().errors[0].message).toBe(CANDIDATURE_NON_TROUVEE);
  });

  describe("candidacy_searchOrganismsForCandidacyAsAdmin", () => {
    test("allows an admin to request an organism search", async () => {
      const response = await query({
        endpoint: "candidacy_searchOrganismsForCandidacyAsAdmin",
        authorization: asRole("admin"),
        arguments: { candidacyId: faker.string.uuid() },
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(CANDIDATURE_NON_TROUVEE);
    });

    test.each<KeyCloakUserRole>([
      "candidate",
      "manage_candidacy",
      "gestion_maison_mere_aap",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await query({
        endpoint: "candidacy_searchOrganismsForCandidacyAsAdmin",
        authorization: asRole(role),
        arguments: { candidacyId: faker.string.uuid() },
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await query({
        endpoint: "candidacy_searchOrganismsForCandidacyAsAdmin",
        arguments: { candidacyId: faker.string.uuid() },
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("candidacy_candidacyCountByStatus", () => {
    test("rejects the candidate role", async () => {
      const response = await query({
        endpoint: "candidacy_candidacyCountByStatus",
        authorization: asRole("candidate"),
        returnFields: "{ PROJET_HORS_ABANDON }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test.each<KeyCloakUserRole>([
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await query({
        endpoint: "candidacy_candidacyCountByStatus",
        authorization: asRole(role),
        returnFields: "{ PROJET_HORS_ABANDON }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await query({
        endpoint: "candidacy_candidacyCountByStatus",
        returnFields: "{ PROJET_HORS_ABANDON }",
      });

      // TODO: improve the policy code to return a proper SESSION_EXPIRED
      expect(response.json()).toHaveProperty("errors");
      expect(response.json().data).toBeNull();
    });
  });

  describe("candidacy_getCandidacyCcns", () => {
    test.each<KeyCloakUserRole>([
      "admin",
      "candidate",
      "manage_candidacy",
      "gestion_maison_mere_aap",
    ])(
      "allows the %s role to list collective agreements",
      async (role: KeyCloakUserRole) => {
        const response = await query({
          endpoint: "candidacy_getCandidacyCcns",
          authorization: asRole(role),
          returnFields: "{ rows { id } }",
        });

        expect(response.json()).not.toHaveProperty("errors");
        expect(
          response.json().data.candidacy_getCandidacyCcns.rows,
        ).toBeInstanceOf(Array);
      },
    );

    test.each<KeyCloakUserRole>([
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await query({
        endpoint: "candidacy_getCandidacyCcns",
        authorization: asRole(role),
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await query({
        endpoint: "candidacy_getCandidacyCcns",
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  test("allows an unauthenticated request to check candidacy access", async () => {
    const candidacy = await createCandidacyHelper();

    const response = await query({
      endpoint: "candidacy_canAccessCandidacy",
      arguments: { candidacyId: candidacy.id },
      returnFields: "",
    });

    expect(response.json()).not.toHaveProperty("errors");
    expect(response.json().data.candidacy_canAccessCandidacy).toBe(false);
  });

  describe("candidacy_getCandidaciesForCertificationAuthority", () => {
    test("allows an admin to list candidacies", async () => {
      const response = await query({
        endpoint: "candidacy_getCandidaciesForCertificationAuthority",
        authorization: asRole("admin"),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_getCandidaciesForCertificationAuthority
          .rows,
      ).toBeInstanceOf(Array);
    });

    test("allows a certification authority manager to list candidacies", async () => {
      const certificationAuthority = await createCertificationAuthorityHelper();

      const response = await query({
        endpoint: "candidacy_getCandidaciesForCertificationAuthority",
        authorization: asRole(
          "manage_certification_authority_local_account",
          certificationAuthority.Account[0].keycloakId,
        ),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_getCandidaciesForCertificationAuthority
          .rows,
      ).toBeInstanceOf(Array);
    });

    test("allows a certification authority local account to list candidacies", async () => {
      const localAccount =
        await createCertificationAuthorityLocalAccountHelper();

      const response = await query({
        endpoint: "candidacy_getCandidaciesForCertificationAuthority",
        authorization: asRole(
          "manage_feasibility",
          localAccount.account.keycloakId,
        ),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_getCandidaciesForCertificationAuthority
          .rows,
      ).toBeInstanceOf(Array);
    });

    test.each<KeyCloakUserRole>([
      "candidate",
      "manage_candidacy",
      "gestion_maison_mere_aap",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await query({
        endpoint: "candidacy_getCandidaciesForCertificationAuthority",
        authorization: asRole(role),
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await query({
        endpoint: "candidacy_getCandidaciesForCertificationAuthority",
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("candidacy_getCandidaciesForAAP", () => {
    test("allows an admin to list candidacies", async () => {
      const response = await query({
        endpoint: "candidacy_getCandidaciesForAAP",
        authorization: asRole("admin"),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_getCandidaciesForAAP.rows,
      ).toBeInstanceOf(Array);
    });

    test("allows the maison mere manager to list candidacies associated to its maison mere", async () => {
      const organism = await createOrganismHelper();
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { organismId: organism.id },
      });

      const response = await query({
        endpoint: "candidacy_getCandidaciesForAAP",
        authorization: asRole(
          "gestion_maison_mere_aap",
          organism.maisonMereAAP!.gestionnaire.keycloakId,
        ),
        returnFields: "{ rows { id } }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_getCandidaciesForAAP.rows,
      ).toContainEqual({ id: candidacy.id });
    });

    test.each<KeyCloakUserRole>([
      "candidate",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await query({
        endpoint: "candidacy_getCandidaciesForAAP",
        authorization: asRole(role),
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await query({
        endpoint: "candidacy_getCandidaciesForAAP",
        returnFields: "{ rows { id } }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });
});
