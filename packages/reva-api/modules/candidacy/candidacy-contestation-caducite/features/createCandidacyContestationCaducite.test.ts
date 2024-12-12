import { faker } from "@faker-js/faker/.";
import { CertificationAuthorityContestationDecision } from "@prisma/client";
import { prismaClient } from "../../../../prisma/client";
import { createCandidacyHelper } from "../../../../test/helpers/entities/create-candidacy-helper";
import { clearDatabase } from "../../../../test/jestClearDatabaseBeforeEachTestFile";
import { createCandidacyContestationCaducite } from "./createCandidacyContestationCaducite";

describe("createCandidacyContestationCaducite", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Input validation", () => {
    test("should fail when contestationReason is empty", async () => {
      const candidacy = await createCandidacyHelper();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const createContestationPromise = createCandidacyContestationCaducite({
        candidacyId: candidacy.id,
        contestationReason: "",
        readyForJuryEstimatedAt: futureDate,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La raison de la contestation est obligatoire",
      );
    });

    test("should fail when readyForJuryEstimatedAt is in the past", async () => {
      const candidacy = await createCandidacyHelper();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const createContestationPromise = createCandidacyContestationCaducite({
        candidacyId: candidacy.id,
        contestationReason: "Valid reason",
        readyForJuryEstimatedAt: pastDate,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La date prévisionnelle ne peut pas être dans le passé",
      );
    });
  });

  describe("Candidacy validation", () => {
    test("should fail when candidacy does not exist", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const createContestationPromise = createCandidacyContestationCaducite({
        candidacyId: faker.string.uuid(),
        contestationReason: "Valid reason",
        readyForJuryEstimatedAt: futureDate,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La candidature n'a pas été trouvée",
      );
    });

    test("should fail when a contestation is pending", async () => {
      const candidacy = await createCandidacyHelper();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await prismaClient.candidacyContestationCaducite.create({
        data: {
          candidacyId: candidacy.id,
          contestationReason: "Initial contestation",
          certificationAuthorityContestationDecision:
            CertificationAuthorityContestationDecision.DECISION_PENDING,
        },
      });

      const createContestationPromise = createCandidacyContestationCaducite({
        candidacyId: candidacy.id,
        contestationReason: "Another contestation",
        readyForJuryEstimatedAt: futureDate,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La caducité de la candidature a été confirmée ou est en attente de décision",
      );
    });

    test("should fail when caducity has been confirmed", async () => {
      const candidacy = await createCandidacyHelper();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await prismaClient.candidacyContestationCaducite.create({
        data: {
          candidacyId: candidacy.id,
          contestationReason: "Initial contestation",
          certificationAuthorityContestationDecision:
            CertificationAuthorityContestationDecision.CADUCITE_CONFIRMED,
        },
      });

      const createContestationPromise = createCandidacyContestationCaducite({
        candidacyId: candidacy.id,
        contestationReason: "Another contestation",
        readyForJuryEstimatedAt: futureDate,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La caducité de la candidature a été confirmée ou est en attente de décision",
      );
    });
  });

  describe("Successful creation", () => {
    test("should successfully create a contestation and update readyForJuryEstimatedAt", async () => {
      const candidacy = await createCandidacyHelper();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = await createCandidacyContestationCaducite({
        candidacyId: candidacy.id,
        contestationReason: "Valid contestation reason",
        readyForJuryEstimatedAt: futureDate,
      });

      expect(result).toMatchObject({
        candidacyId: candidacy.id,
        contestationReason: "Valid contestation reason",
      });

      const updatedCandidacy = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updatedCandidacy?.readyForJuryEstimatedAt?.getTime()).toBe(
        futureDate.getTime(),
      );
    });

    test("should allow new contestation when previous one was invalidated", async () => {
      const candidacy = await createCandidacyHelper();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await prismaClient.candidacyContestationCaducite.create({
        data: {
          candidacyId: candidacy.id,
          contestationReason: "Initial contestation",
          certificationAuthorityContestationDecision:
            CertificationAuthorityContestationDecision.CADUCITE_INVALIDATED,
        },
      });

      const result = await createCandidacyContestationCaducite({
        candidacyId: candidacy.id,
        contestationReason: "New valid contestation",
        readyForJuryEstimatedAt: futureDate,
      });

      expect(result).toMatchObject({
        candidacyId: candidacy.id,
        contestationReason: "New valid contestation",
      });
    });
  });
});
