import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { updateLastActivityDate } from "./updateLastActivityDate";

describe("updateLastActivityDate", () => {
  test("should fail when readyForJuryEstimatedAt is in the past", async () => {
    const candidacy = await createCandidacyHelper();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    await expect(async () => {
      await updateLastActivityDate({
        candidacyId: candidacy.id,
        readyForJuryEstimatedAt: pastDate,
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
        candidacyId: "non-existent-id",
        readyForJuryEstimatedAt: futureDate,
      });
    }).rejects.toThrow();
  });

  test("should successfully update lastActivityDate and readyForJuryEstimatedAt", async () => {
    const candidacy = await createCandidacyHelper();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const updatedCandidacy = await updateLastActivityDate({
      candidacyId: candidacy.id,
      readyForJuryEstimatedAt: futureDate,
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
