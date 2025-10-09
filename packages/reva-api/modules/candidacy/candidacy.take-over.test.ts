import { CandidacyStatusStep } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

test("candidacy_takeOver should fail when not authenticated", async function () {
  const candidacy = await createCandidacyHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: "blabla",
      }),
    },
  });

  const candidacy_takeOver = graphql(`
    mutation candidacy_takeOver_not_authorized($candidacyId: ID!) {
      candidacy_takeOver(candidacyId: $candidacyId) {
        id
      }
    }
  `);

  await expect(
    graphqlClient.request(candidacy_takeOver, {
      candidacyId: candidacy.id,
    }),
  ).rejects.toThrowError("You are not authorized!");
});

test("candidacy_takeOver should fail when user is admin", async function () {
  const candidacy = await createCandidacyHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "blabla",
      }),
    },
  });

  const candidacy_takeOver = graphql(`
    mutation candidacy_takeOver_is_admin($candidacyId: ID!) {
      candidacy_takeOver(candidacyId: $candidacyId) {
        id
      }
    }
  `);

  await expect(
    graphqlClient.request(candidacy_takeOver, {
      candidacyId: candidacy.id,
    }),
  ).rejects.toThrowError("You are not authorized!");
});

test("candidacy_takeOver should fail when candidacy manager has wrong organism", async function () {
  const candidacy = await createCandidacyHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: "00000000-0000-0000-0000-000000000000",
      }),
    },
  });

  const candidacy_takeOver = graphql(`
    mutation candidacy_takeOver_wrong_organism($candidacyId: ID!) {
      candidacy_takeOver(candidacyId: $candidacyId) {
        id
      }
    }
  `);

  await expect(
    graphqlClient.request(candidacy_takeOver, {
      candidacyId: candidacy.id,
    }),
  ).rejects.toThrowError("Votre compte utilisateur est introuvable.");
});

test("candidacy_takeOver should do nothing when candidacy status is not validation", async function () {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.PROJET,
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: candidacy.organism?.accounts[0].keycloakId,
      }),
    },
  });

  const candidacy_takeOver = graphql(`
    mutation candidacy_takeOver_is_not_validation_status($candidacyId: ID!) {
      candidacy_takeOver(candidacyId: $candidacyId) {
        id
        status
      }
    }
  `);

  const res = await graphqlClient.request(candidacy_takeOver, {
    candidacyId: candidacy.id,
  });

  expect(res).toMatchObject({
    candidacy_takeOver: { id: candidacy.id, status: "PROJET" },
  });
});

test("candidacy_takeOver should update candidacy statuses when active status is validation", async function () {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.VALIDATION,
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: candidacy.organism?.accounts[0].keycloakId,
      }),
    },
  });

  const candidacy_takeOver = graphql(`
    mutation candidacy_takeOver_is_validation_status($candidacyId: ID!) {
      candidacy_takeOver(candidacyId: $candidacyId) {
        id
        status
      }
    }
  `);

  const res = await graphqlClient.request(candidacy_takeOver, {
    candidacyId: candidacy.id,
  });

  expect(res).toMatchObject({
    candidacy_takeOver: { id: candidacy.id },
  });
});
