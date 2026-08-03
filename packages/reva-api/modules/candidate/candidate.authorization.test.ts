import { faker } from "@faker-js/faker";

import * as getKeycloakAdminModule from "@/modules/shared/auth/getKeycloakAdmin";
import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import { FRANCE_CONNECT_SANDBOX_EMAILS } from "./features/franceConnectSandboxEmails.constant";

// Autorisation de chaque resolver candidate : qui passe, qui est refusé.
// Complète les suites existantes (candidate.test.ts, candidate.update*.test.ts) : seules
// les branches qu'elles ne couvrent pas sont testées ici.

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

describe("candidate - autorisation des resolvers", () => {
  describe("candidate_getCandidateById (admin ou candidat propriétaire)", () => {
    const call = (id: string, authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "candidate_getCandidateById",
          arguments: { id },
          returnFields: "{ id }",
        },
      });

    test("l'AAP : refusé", async () => {
      const candidate = await createCandidateHelper();
      const resp = await call(candidate.id, asRole("manage_candidacy"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const candidate = await createCandidateHelper();
      const resp = await call(candidate.id);
      expect(resp.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("candidate_getCandidateWithCandidacy (public, mais résolu sur l'appelant)", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "candidate_getCandidateWithCandidacy",
          returnFields: "{ id }",
        },
      });

    test("le candidat : autorisé, renvoie son propre identifiant", async () => {
      const candidate = await createCandidateHelper();
      const resp = await call(asRole("candidate", candidate.keycloakId));
      expect(resp.json()).not.toHaveProperty("errors");
      expect(resp.json().data.candidate_getCandidateWithCandidacy.id).toBe(
        candidate.id,
      );
    });

    // Le refus vient de la garde interne du resolver, pas d'une policy : c'est elle qui
    // rend l'absence de policy inoffensive, elle ne doit pas disparaître.
    test("non authentifié : refusé par la garde interne du resolver", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe("Utilisateur non authentifié");
    });
  });

  describe("candidate_getFranceConnectSandboxCandidates (admin)", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "candidate_getFranceConnectSandboxCandidates",
          returnFields: "{ id }",
        },
      });

    test("l'admin : autorisé", async () => {
      const resp = await call(asRole("admin"));
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("l'AAP : refusé", async () => {
      const resp = await call(asRole("manage_candidacy"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("non authentifié : refusé", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("champs de profil de Candidate (publics, protégés par leur parent)", () => {
    // Les 9 champs sont lus par l'AAP et le certificateur via Candidacy.candidate, dont le
    // parent getCandidacyById est déjà protégé par canAccessCandidacy. Un seul appel les
    // verrouille tous : les gater casserait le back-office et reva-interop.
    test("l'AAP propriétaire de la candidature : autorisé sur les 9 champs", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole(
          "manage_candidacy",
          candidacy.organism!.organismOnAccounts[0].account.keycloakId,
        ),
        payload: {
          requestType: "query",
          endpoint: "getCandidacyById",
          arguments: { id: candidacy.id },
          returnFields: `{ candidate {
            department { id }
            country { id }
            birthDepartment { id }
            highestDegree { id }
            niveauDeFormationLePlusEleve { id }
            conventionCollective { id }
            contactInformationCompleted
            civilInformationCompleted
            typologyAndCollectiveAgreementCompleted
          } }`,
        },
      });
      expect(resp.json()).not.toHaveProperty("errors");
    });
  });

  describe("Candidate.candidacy et Candidate.candidacies (admin ou candidat propriétaire)", () => {
    const callCandidacies = (id: string, authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "candidate_getCandidateById",
          arguments: { id },
          returnFields: "{ candidacies { id } }",
        },
      });

    const callCandidateFieldThroughCandidacy = (
      candidacyId: string,
      candidateField: string,
      authorization?: string,
    ) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "getCandidacyById",
          arguments: { id: candidacyId },
          returnFields: `{ candidate { ${candidateField} { id } } }`,
        },
      });

    test("le candidat propriétaire lit ses propres candidatures : autorisé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await callCandidacies(
        candidacy.candidate!.id,
        asRole("candidate", candidacy.candidate!.keycloakId),
      );
      expect(resp.json()).not.toHaveProperty("errors");
      expect(
        resp.json().data.candidate_getCandidateById.candidacies.length,
      ).toBeGreaterThan(0);
    });

    test("l'admin lit les candidatures d'un candidat : autorisé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await callCandidacies(
        candidacy.candidate!.id,
        asRole("admin"),
      );
      expect(resp.json()).not.toHaveProperty("errors");
      expect(
        resp.json().data.candidate_getCandidateById.candidacies.length,
      ).toBeGreaterThan(0);
    });

    test("le candidat propriétaire lit sa candidature courante : autorisé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        payload: {
          requestType: "query",
          endpoint: "candidate_getCandidateWithCandidacy",
          returnFields: "{ candidacy { id } }",
        },
      });
      expect(resp.json()).not.toHaveProperty("errors");
      expect(
        resp.json().data.candidate_getCandidateWithCandidacy.candidacy,
      ).not.toBeNull();
    });

    // Le champ liste TOUTES les candidatures du candidat, pas la seule candidature sur
    // laquelle l'AAP a été autorisé : c'est le déplacement latéral que cette règle interdit.
    test("l'AAP propriétaire de la candidature lit les autres candidatures du candidat : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await callCandidateFieldThroughCandidacy(
        candidacy.id,
        "candidacies",
        asRole(
          "manage_candidacy",
          candidacy.organism!.organismOnAccounts[0].account.keycloakId,
        ),
      );
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("l'AAP propriétaire de la candidature lit la candidature courante du candidat : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await callCandidateFieldThroughCandidacy(
        candidacy.id,
        "candidacy",
        asRole(
          "manage_candidacy",
          candidacy.organism!.organismOnAccounts[0].account.keycloakId,
        ),
      );
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  describe("candidate_updateCandidateInformation (admin ou AAP accompagnateur)", () => {
    const candidateInformationInput = () => ({
      gender: "man",
      lastname: faker.person.lastName(),
      firstname: faker.person.firstName(),
      birthdate: new Date("1990-01-01"),
      birthCity: faker.location.city(),
      countryId: faker.string.uuid(),
      nationality: faker.lorem.word(),
      street: faker.location.streetAddress(),
      zip: faker.string.numeric(5),
      city: faker.location.city(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
    });

    const call = (candidacyId: string, authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "mutation",
          endpoint: "candidate_updateCandidateInformation",
          arguments: {
            candidacyId,
            candidateInformation: candidateInformationInput(),
          },
          enumFields: ["gender"],
          returnFields: "{ id }",
        },
      });

    // Le candidat a son propre point d'entrée (candidate_updateCandidateInformationBySelf),
    // qui verrouille les champs FranceConnect : l'asymétrie est la règle produit.
    test("le candidat propriétaire de la candidature : refusé", async () => {
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
      expect(resp.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("candidate_updateCandidateProfile (admin, AAP accompagnateur ou candidat propriétaire)", () => {
    const call = async (candidacyId: string, authorization?: string) => {
      const degree = await prismaClient.degree.findFirstOrThrow();
      return injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "mutation",
          endpoint: "candidate_updateCandidateProfile",
          arguments: {
            candidacyId,
            candidateProfile: {
              highestDegreeId: degree.id,
              highestDegreeLabel: "Licence",
            },
          },
          returnFields: "{ id }",
        },
      });
    };

    test("le candidat propriétaire de la candidature : autorisé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(
        candidacy.id,
        asRole("candidate", candidacy.candidate!.keycloakId),
      );
      expect(resp.json()).not.toHaveProperty("errors");
    });

    test("le certificateur : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await call(candidacy.id, asRole("manage_feasibility"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  describe("candidate_updateCandidateContactDetails (admin ou AAP accompagnateur)", () => {
    test("le candidat propriétaire de la candidature : refusé", async () => {
      const candidacy = await createCandidacyHelper();
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        payload: {
          requestType: "mutation",
          endpoint: "candidate_updateCandidateContactDetails",
          arguments: {
            candidacyId: candidacy.id,
            candidateId: candidacy.candidate!.id,
            candidateContactDetails: {
              phone: faker.phone.number(),
              email: faker.internet.email(),
            },
          },
          returnFields: "{ id }",
        },
      });
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  describe("candidate_updateCandidateTypologyAndCcn (admin ou candidat propriétaire)", () => {
    // enumFields est obligatoire : sans lui, la typologie serait sérialisée en chaîne et la
    // requête échouerait sur une erreur de type GraphQL, pas sur la policy.
    const call = (candidateId: string, authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "mutation",
          endpoint: "candidate_updateCandidateTypologyAndCcn",
          arguments: {
            candidateId,
            // BENEVOLE est la seule famille de typologies qui n'exige pas de convention
            // collective : la mutation aboutit sans autre argument.
            candidateTypologyAndCcn: { typology: "BENEVOLE" },
          },
          enumFields: ["typology"],
          returnFields: "{ id typology }",
        },
      });

    test("le candidat propriétaire : autorisé, typologie mise à jour", async () => {
      const candidate = await createCandidateHelper();
      const resp = await call(
        candidate.id,
        asRole("candidate", candidate.keycloakId),
      );
      expect(resp.json()).not.toHaveProperty("errors");
      expect(
        resp.json().data.candidate_updateCandidateTypologyAndCcn.typology,
      ).toBe("BENEVOLE");
    });

    test("un autre candidat : refusé, et la typologie reste inchangée", async () => {
      const candidate = await createCandidateHelper();
      const autreCandidat = await createCandidateHelper();
      const resp = await call(
        candidate.id,
        asRole("candidate", autreCandidat.keycloakId),
      );
      expect(resp.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
      const enBase = await prismaClient.candidate.findUniqueOrThrow({
        where: { id: candidate.id },
      });
      expect(enBase.typology).toBe(candidate.typology);
    });

    test("l'AAP : refusé", async () => {
      const candidate = await createCandidateHelper();
      const resp = await call(candidate.id, asRole("manage_candidacy"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });
  });

  describe("candidate_deleteFranceConnectSandboxCandidates (admin)", () => {
    // Seul le refus est testé ici : le chemin accepté appelle Keycloak. La feature
    // elle-même est couverte par deleteFranceConnectSandboxCandidates.test.ts.
    test("l'AAP : refusé, et le candidat sandbox existe toujours", async () => {
      const candidate = await createCandidateHelper({
        email: FRANCE_CONNECT_SANDBOX_EMAILS[0],
      });
      const resp = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("manage_candidacy"),
        payload: {
          requestType: "mutation",
          endpoint: "candidate_deleteFranceConnectSandboxCandidates",
          arguments: { emails: [FRANCE_CONNECT_SANDBOX_EMAILS[0]] },
          returnFields: "",
        },
      });
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
      expect(
        await prismaClient.candidate.findUnique({
          where: { id: candidate.id },
        }),
      ).not.toBeNull();
    });
  });

  describe("mutations publiques (parcours de connexion)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // Le jeton invalide échoue dans le parsing du JWT, donc APRÈS la policy : c'est la
    // preuve que la mutation est bien publique.
    test("candidate_loginWithToken : public, atteint la feature", async () => {
      const resp = await injectGraphql({
        fastify: global.testApp,
        payload: {
          requestType: "mutation",
          endpoint: "candidate_loginWithToken",
          arguments: { token: "jeton-invalide" },
          returnFields: "",
        },
      });
      expect(resp.json().errors[0].message).toBe(
        "Error while parsing JWT token",
      );
    });

    test("candidate_forgotPassword : public, renvoie true", async () => {
      vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
        () =>
          Promise.resolve({
            users: { find: vi.fn().mockResolvedValue([]) },
          }) as unknown as ReturnType<
            typeof getKeycloakAdminModule.getKeycloakAdmin
          >,
      );

      const resp = await injectGraphql({
        fastify: global.testApp,
        payload: {
          requestType: "mutation",
          endpoint: "candidate_forgotPassword",
          arguments: { email: faker.internet.email() },
          returnFields: "",
        },
      });
      expect(resp.json()).not.toHaveProperty("errors");
      expect(resp.json().data.candidate_forgotPassword).toBe(true);
    });
  });
});
