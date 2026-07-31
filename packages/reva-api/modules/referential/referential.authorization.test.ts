import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED as UNAUTHENTICATED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Autorisation des resolvers referential : le référentiel est public par conception (site
// vitrine, inscription AAP, recherche de certification avant connexion), seules l'administration
// des certifications et la recherche admin sont protégées.

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const query = ({
  endpoint,
  args,
  returnFields,
  authorization,
}: {
  endpoint: string;
  args?: Record<string, unknown>;
  returnFields: string;
  authorization?: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "query",
      endpoint,
      arguments: args,
      returnFields,
    },
  });

describe("referential - autorisation des resolvers", () => {
  describe("référentiel public", () => {
    // Un seul appel verrouille `Query.getCertification` et le bloc `Certification.*`.
    test("getCertification et ses champs, non authentifié : autorisé", async () => {
      const certification = await createCertificationHelper();

      const resp = await query({
        endpoint: "getCertification",
        args: { certificationId: certification.id },
        returnFields: `{
          degree { level }
          competenceBlocs { id }
          domains { id }
          prerequisites { id }
          formacodes { code }
          additionalInfo { id }
          isAapAvailable
        }`,
      });
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("getReferential, non authentifié : autorisé", async () => {
      const resp = await query({
        endpoint: "getReferential",
        returnFields: "{ goals { id } }",
      });
      expect(resp.json()).not.toHaveProperty("errors");
    });

    // Verrouille aussi le champ `Department.region`.
    test("getDepartments, non authentifié : autorisé", async () => {
      const resp = await query({
        endpoint: "getDepartments",
        returnFields: "{ id region { id } }",
      });
      expect(resp.json()).not.toHaveProperty("errors");
    });

    // Contrat public de l'app candidat : la recherche a lieu avant toute candidature.
    test("searchCertificationsForCandidate, non authentifié : autorisé", async () => {
      const resp = await query({
        endpoint: "searchCertificationsForCandidate",
        returnFields: "{ rows { id } }",
      });
      expect(resp.json()).not.toHaveProperty("errors");
    });
  });

  describe("searchCertificationsForAdmin (admin)", () => {
    const call = (authorization?: string) =>
      query({
        endpoint: "searchCertificationsForAdmin",
        returnFields: "{ rows { id } }",
        authorization,
      });

    test("admin : autorisé", async () => {
      const resp = await call(asRole("admin"));
      expect(resp.json()).not.toHaveProperty("errors");
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

  describe("searchCertificationsV2ForRegistryManager (admin ou responsable de référentiel)", () => {
    const call = (authorization?: string) =>
      query({
        endpoint: "searchCertificationsV2ForRegistryManager",
        returnFields: "{ rows { id } }",
        authorization,
      });

    // La feature exige un vrai responsable de référentiel derrière le compte appelant.
    test("le responsable de référentiel : autorisé", async () => {
      const structure = await createCertificationAuthorityStructureHelper();
      const resp = await call(
        asRole(
          "manage_certification_registry",
          structure.certificationRegistryManager!.account.keycloakId,
        ),
      );
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("AAP : refusé", async () => {
      const resp = await call(asRole("manage_candidacy"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  // Refus uniquement : le chemin accepté appellerait l'API entreprise externe.
  describe("getEtablissementAsAdmin (admin)", () => {
    test("AAP : refusé", async () => {
      const resp = await query({
        endpoint: "getEtablissementAsAdmin",
        args: { siret: "12345678900011" },
        returnFields: "{ siret }",
        authorization: asRole("manage_candidacy"),
      });
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  // Représentant des mutations réservées à l'admin.
  describe("referential_addCertification (admin)", () => {
    test("AAP : refusé", async () => {
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("manage_candidacy"),
        payload: {
          requestType: "mutation",
          endpoint: "referential_addCertification",
          arguments: { input: { codeRncp: "34825" } },
          returnFields: "{ id }",
        },
      });
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  // Représentant des mutations ouvertes au responsable de référentiel de la certification.
  describe("referential_updateCertificationDescription (admin ou responsable de référentiel)", () => {
    // Identifiant fictif : le refus porte sur le rôle, avant toute lecture de la certification.
    test("AAP : refusé", async () => {
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("manage_candidacy"),
        payload: {
          requestType: "mutation",
          endpoint: "referential_updateCertificationDescription",
          arguments: { input: { certificationId: faker.string.uuid() } },
          returnFields: "{ id }",
        },
      });
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });
});
