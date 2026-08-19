import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

import type { UpdateCandidateInput } from "../../graphql/generated/graphql";

const candidacy_createCandidacy = graphql(`
  mutation candidacy_createCandidacy_authorization(
    $candidateId: UUID!
    $data: CreateCandidacyInput!
  ) {
    candidacy_createCandidacy(candidateId: $candidateId, data: $data) {
      id
    }
  }
`);

const candidacy_updateContact = graphql(`
  mutation candidacy_updateContact_authorization(
    $candidateId: ID!
    $candidateData: UpdateCandidateInput!
  ) {
    candidacy_updateContact(
      candidateId: $candidateId
      candidateData: $candidateData
    ) {
      id
    }
  }
`);

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const createCandidacy = ({
  authorization,
  candidateId,
}: {
  authorization?: string;
  candidateId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(candidacy_createCandidacy, {
    candidateId,
    data: { typeAccompagnement: "ACCOMPAGNE" },
  });
};

const updateContact = ({
  authorization,
  candidateId,
  candidateData,
}: {
  authorization?: string;
  candidateId: string;
  candidateData: UpdateCandidateInput;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(candidacy_updateContact, {
    candidateId,
    candidateData,
  });
};

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

      const response = await createCandidacy({
        authorization: asRole("admin"),
        candidateId: candidate.id,
      });

      expect(response.candidacy_createCandidacy?.id).toBeDefined();
    });

    test("allows a candidate to create their own candidacy", async () => {
      const candidate = await createCandidateHelper();

      const response = await createCandidacy({
        authorization: asRole("candidate", candidate.keycloakId),
        candidateId: candidate.id,
      });

      expect(response.candidacy_createCandidacy?.id).toBeDefined();
    });

    test("rejects a random candidate acting on another candidate", async () => {
      const candidate = await createCandidateHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        createCandidacy({
          authorization: asRole("candidate", randomCandidate.keycloakId),
          candidateId: candidate.id,
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test.each(unsupportedCandidateWriteRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        await expect(
          createCandidacy({
            authorization: asRole(role),
            candidateId: faker.string.uuid(),
          }),
        ).rejects.toThrowError(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      await expect(
        createCandidacy({ candidateId: faker.string.uuid() }),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });

  describe("candidacy_updateContact", () => {
    test("allows an admin to act on any candidate", async () => {
      const candidate = await createCandidateHelper();

      const response = await updateContact({
        authorization: asRole("admin"),
        candidateId: candidate.id,
        candidateData: {
          firstname: candidate.firstname,
          lastname: candidate.lastname,
          phone: faker.phone.number(),
          email: candidate.email,
        },
      });

      expect(response.candidacy_updateContact?.id).toBeDefined();
    });

    test("allows a candidate to update their own contact information", async () => {
      const candidate = await createCandidateHelper();

      const response = await updateContact({
        authorization: asRole("candidate", candidate.keycloakId),
        candidateId: candidate.id,
        candidateData: {
          firstname: candidate.firstname,
          lastname: candidate.lastname,
          phone: faker.phone.number(),
          email: candidate.email,
        },
      });

      expect(response.candidacy_updateContact?.id).toBe(candidate.id);
    });

    test("rejects a random candidate acting on another candidate", async () => {
      const candidate = await createCandidateHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        updateContact({
          authorization: asRole("candidate", randomCandidate.keycloakId),
          candidateId: candidate.id,
          candidateData: { phone: faker.phone.number() },
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test.each(unsupportedCandidateWriteRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        await expect(
          updateContact({
            authorization: asRole(role),
            candidateId: faker.string.uuid(),
            candidateData: {
              firstname: faker.person.firstName(),
              lastname: faker.person.lastName(),
              phone: faker.phone.number(),
              email: faker.internet.email(),
            },
          }),
        ).rejects.toThrowError(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      await expect(
        updateContact({
          candidateId: faker.string.uuid(),
          candidateData: {
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
          },
        }),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });
});
