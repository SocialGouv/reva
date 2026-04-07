import { graphql } from "@/modules/graphql/generated";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

const getCandidacyCertificationAuthorityLocalAccountsQuery = graphql(`
  query getCandidacyCertificationAuthorityLocalAccounts($id: ID!) {
    getCandidacyById(id: $id) {
      certificationAuthorityLocalAccounts {
        contactEmail
        contactFullName
        contactPhone
      }
    }
  }
`);

const fetchCertificationAuthorityLocalAccounts = async (
  candidacyId: string,
) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "admin-user",
      }),
    },
  });

  const response = await graphqlClient.request(
    getCandidacyCertificationAuthorityLocalAccountsQuery,
    { id: candidacyId },
  );

  return response.getCandidacyById?.certificationAuthorityLocalAccounts ?? [];
};

describe("getCandidacyCertificationAuthorityLocalAccounts", () => {
  test("should deduplicate local accounts sharing the same email and phone", async () => {
    const candidacy = await createCandidacyHelper();

    const localAccountOne =
      await createCertificationAuthorityLocalAccountHelper({
        contactEmail: "duplicate@example.com",
        contactFullName: "First Contact",
        contactPhone: "0101010101",
      });

    const localAccountTwo =
      await createCertificationAuthorityLocalAccountHelper({
        certificationAuthorityId: localAccountOne.certificationAuthorityId,
        contactEmail: "duplicate@example.com",
        contactFullName: "Second Contact",
        contactPhone: "0101010101",
      });

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.createMany(
      {
        data: [
          {
            candidacyId: candidacy.id,
            certificationAuthorityLocalAccountId: localAccountOne.id,
          },
          {
            candidacyId: candidacy.id,
            certificationAuthorityLocalAccountId: localAccountTwo.id,
          },
        ],
      },
    );

    const result = await fetchCertificationAuthorityLocalAccounts(candidacy.id);

    expect(result).toHaveLength(1);

    const [localAccount] = result;
    if (!localAccount) {
      throw new Error("Expected a local account to be returned");
    }
    expect(localAccount.contactEmail).toEqual("duplicate@example.com");
    expect(localAccount.contactPhone).toEqual("0101010101");
    expect([
      localAccountOne.contactFullName,
      localAccountTwo.contactFullName,
    ]).toContain(localAccount.contactFullName);
  });

  test("should keep local accounts when only email matches but phone differs", async () => {
    const candidacy = await createCandidacyHelper();

    const localAccountOne =
      await createCertificationAuthorityLocalAccountHelper({
        contactEmail: "duplicate@example.com",
        contactFullName: "First Contact",
        contactPhone: "0101010101",
      });

    const localAccountTwo =
      await createCertificationAuthorityLocalAccountHelper({
        certificationAuthorityId: localAccountOne.certificationAuthorityId,
        contactEmail: "duplicate@example.com",
        contactFullName: "Second Contact",
        contactPhone: "0202020202",
      });

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.createMany(
      {
        data: [
          {
            candidacyId: candidacy.id,
            certificationAuthorityLocalAccountId: localAccountOne.id,
          },
          {
            candidacyId: candidacy.id,
            certificationAuthorityLocalAccountId: localAccountTwo.id,
          },
        ],
      },
    );

    const result = await fetchCertificationAuthorityLocalAccounts(candidacy.id);

    expect(result).toHaveLength(2);

    const phones = result.map((account) => account?.contactPhone).sort();
    expect(phones).toEqual(["0101010101", "0202020202"]);
  });

  test("should keep local accounts with distinct emails", async () => {
    const candidacy = await createCandidacyHelper();

    const localAccountOne =
      await createCertificationAuthorityLocalAccountHelper({
        contactEmail: "unique-one@example.com",
        contactFullName: "Unique One",
        contactPhone: "0303030303",
      });

    const localAccountTwo =
      await createCertificationAuthorityLocalAccountHelper({
        certificationAuthorityId: localAccountOne.certificationAuthorityId,
        contactEmail: "unique-two@example.com",
        contactFullName: "Unique Two",
        contactPhone: "0404040404",
      });

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.createMany(
      {
        data: [
          {
            candidacyId: candidacy.id,
            certificationAuthorityLocalAccountId: localAccountOne.id,
          },
          {
            candidacyId: candidacy.id,
            certificationAuthorityLocalAccountId: localAccountTwo.id,
          },
        ],
      },
    );

    const result = await fetchCertificationAuthorityLocalAccounts(candidacy.id);

    expect(result).toHaveLength(2);

    const firstAccount = result[0];
    const secondAccount = result[1];

    if (!firstAccount || !secondAccount) {
      throw new Error("Expected two local accounts to be returned");
    }

    expect(
      [firstAccount.contactEmail, secondAccount.contactEmail].sort(),
    ).toEqual(["unique-one@example.com", "unique-two@example.com"]);
  });
});
