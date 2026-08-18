import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const mutation = ({
  endpoint,
  authorization,
  arguments: mutationArguments,
  enumFields,
  returnFields,
}: {
  endpoint: string;
  authorization?: string;
  arguments?: Record<string, unknown>;
  enumFields?: string[];
  returnFields: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "mutation",
      endpoint,
      arguments: mutationArguments,
      enumFields,
      returnFields,
    },
  });

const unsupportedCandidateWriteRoles: KeyCloakUserRole[] = [
  "manage_candidacy",
  "gestion_maison_mere_aap",
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

describe("candidacy candidate-side resolver authorization", () => {
  describe("candidacy_createCandidacy", () => {
    test("allows an admin to act on any candidate", async () => {
      const candidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_createCandidacy",
        authorization: asRole("admin"),
        arguments: {
          candidateId: candidate.id,
          data: { typeAccompagnement: "ACCOMPAGNE" },
        },
        enumFields: ["typeAccompagnement"],
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_createCandidacy.id).toBeDefined();
    });

    test("allows a candidate to create their own candidacy", async () => {
      const candidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_createCandidacy",
        authorization: asRole("candidate", candidate.keycloakId),
        arguments: {
          candidateId: candidate.id,
          data: { typeAccompagnement: "ACCOMPAGNE" },
        },
        enumFields: ["typeAccompagnement"],
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_createCandidacy.id).toBeDefined();
    });

    test("rejects a random candidate acting on another candidate", async () => {
      const candidate = await createCandidateHelper();
      const randomCandidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_createCandidacy",
        authorization: asRole("candidate", randomCandidate.keycloakId),
        arguments: {
          candidateId: candidate.id,
          data: { typeAccompagnement: "ACCOMPAGNE" },
        },
        enumFields: ["typeAccompagnement"],
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });

    test.each(unsupportedCandidateWriteRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        const response = await mutation({
          endpoint: "candidacy_createCandidacy",
          authorization: asRole(role),
          arguments: {
            candidateId: faker.string.uuid(),
            data: { typeAccompagnement: "ACCOMPAGNE" },
          },
          enumFields: ["typeAccompagnement"],
          returnFields: "{ id }",
        });

        expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      const response = await mutation({
        endpoint: "candidacy_createCandidacy",
        arguments: {
          candidateId: faker.string.uuid(),
          data: { typeAccompagnement: "ACCOMPAGNE" },
        },
        enumFields: ["typeAccompagnement"],
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("candidacy_updateContact", () => {
    test("allows an admin to act on any candidate", async () => {
      const candidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_updateContact",
        authorization: asRole("admin"),
        arguments: {
          candidateId: candidate.id,
          candidateData: {
            firstname: candidate.firstname,
            lastname: candidate.lastname,
            phone: faker.phone.number(),
            email: candidate.email,
          },
        },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_updateContact.id).toBeDefined();
    });

    test("allows a candidate to update their own contact information", async () => {
      const candidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_updateContact",
        authorization: asRole("candidate", candidate.keycloakId),
        arguments: {
          candidateId: candidate.id,
          candidateData: {
            firstname: candidate.firstname,
            lastname: candidate.lastname,
            phone: faker.phone.number(),
            email: candidate.email,
          },
        },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_updateContact.id).toBe(
        candidate.id,
      );
    });

    test("rejects a random candidate acting on another candidate", async () => {
      const candidate = await createCandidateHelper();
      const randomCandidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_updateContact",
        authorization: asRole("candidate", randomCandidate.keycloakId),
        arguments: {
          candidateId: candidate.id,
          candidateData: { phone: faker.phone.number() },
        },
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });

    test.each(unsupportedCandidateWriteRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        const response = await mutation({
          endpoint: "candidacy_updateContact",
          authorization: asRole(role),
          arguments: {
            candidateId: faker.string.uuid(),
            candidateData: {
              firstname: faker.person.firstName(),
              lastname: faker.person.lastName(),
              phone: faker.phone.number(),
              email: faker.internet.email(),
            },
          },
          returnFields: "{ id }",
        });

        expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      const response = await mutation({
        endpoint: "candidacy_updateContact",
        arguments: {
          candidateId: faker.string.uuid(),
          candidateData: {
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
          },
        },
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });
});
