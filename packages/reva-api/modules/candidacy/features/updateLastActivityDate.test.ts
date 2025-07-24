import { randomUUID } from "crypto";

import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";

import { updateLastActivityDate } from "./updateLastActivityDate";

const CONTEXT = {
  auth: {
    userInfo: {
      sub: randomUUID(),
      email: "test@test.com",
      email_verified: true,
      preferred_username: "test",
      realm_access: { roles: ["candidate" as KeyCloakUserRole] },
    },
    hasRole: (_role: string) => true,
  },
  app: {
    keycloak: {
      hasRole: (_role: string) => true,
    },
  },
};

describe("updateLastActivityDate", () => {
  test("should fail when readyForJuryEstimatedAt is in the past", async () => {
    const candidacy = await createCandidacyHelper();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    await expect(async () => {
      await updateLastActivityDate({
        input: {
          candidacyId: candidacy.id,
          readyForJuryEstimatedAt: pastDate,
        },
        context: CONTEXT,
      });
    }).rejects.toThrow(
      "La date de préparation pour le jury ne peut être dans le passé",
    );
  });

  test("should fail when candidacy does not exist", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await expect(async () => {
      await updateLastActivityDate({
        input: {
          candidacyId: "non-existent-id",
          readyForJuryEstimatedAt: futureDate,
        },
        context: CONTEXT,
      });
    }).rejects.toThrow();
  });

  test("should successfully update lastActivityDate and readyForJuryEstimatedAt", async () => {
    const candidacy = await createCandidacyHelper();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const updatedCandidacy = await updateLastActivityDate({
      input: {
        candidacyId: candidacy.id,
        readyForJuryEstimatedAt: futureDate,
      },
      context: CONTEXT,
    });

    expect(updatedCandidacy.readyForJuryEstimatedAt?.getTime()).toBe(
      futureDate.getTime(),
    );

    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    expect(updatedCandidacy.lastActivityDate?.getTime()).toBeGreaterThan(
      fiveSecondsAgo.getTime(),
    );
    expect(updatedCandidacy.lastActivityDate?.getTime()).toBeLessThanOrEqual(
      now.getTime(),
    );
  });
});
