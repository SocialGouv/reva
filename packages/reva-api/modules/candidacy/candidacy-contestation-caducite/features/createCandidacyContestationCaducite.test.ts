/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { faker } from "@faker-js/faker/.";
import { CertificationAuthorityContestationDecision } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import { prismaClient } from "../../../../prisma/client";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../../../test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { clearDatabase } from "../../../../test/jestClearDatabaseBeforeEachTestFile";
import { createCandidacyContestationCaducite } from "./createCandidacyContestationCaducite";
import { randomUUID } from "crypto";

const VALID_CONTESTATION_REASON = "Valid contestation reason";
const FUTURE_DATE = addDays(new Date(), 30);
const PAST_DATE = subDays(new Date(), 1);
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

const createContestationMutation = async ({
  keycloakId,
  candidacyId,
  contestationReason,
  readyForJuryEstimatedAt,
}: {
  keycloakId: string;
  candidacyId: string;
  contestationReason: string;
  readyForJuryEstimatedAt: Date;
}) =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_contestation_caducite_create_contestation",
      arguments: {
        candidacyId,
        contestationReason,
        readyForJuryEstimatedAt,
      },
      returnFields: "{id,contestationReason}",
    },
  });

describe("createCandidacyContestationCaducite", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Input validation", () => {
    test("should fail when contestationReason is empty", async () => {
      const candidacy = await createCandidacyHelper();

      const createContestationPromise = createCandidacyContestationCaducite({
        input: {
          candidacyId: candidacy.id,
          contestationReason: "",
          readyForJuryEstimatedAt: FUTURE_DATE,
        },
        context: CONTEXT,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La raison de la contestation est obligatoire",
      );
    });

    test("should fail when readyForJuryEstimatedAt is in the past", async () => {
      const candidacy = await createCandidacyHelper();

      const createContestationPromise = createCandidacyContestationCaducite({
        input: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          readyForJuryEstimatedAt: PAST_DATE,
        },
        context: CONTEXT,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La date prévisionnelle ne peut pas être dans le passé",
      );
    });
  });

  describe("Candidacy validation", () => {
    test("should fail when candidacy does not exist", async () => {
      const createContestationPromise = createCandidacyContestationCaducite({
        input: {
          candidacyId: faker.string.uuid(),
          contestationReason: VALID_CONTESTATION_REASON,
          readyForJuryEstimatedAt: FUTURE_DATE,
        },
        context: CONTEXT,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La candidature n'a pas été trouvée",
      );
    });

    test("should fail when a contestation is pending", async () => {
      const candidacy = await createCandidacyHelper();

      await prismaClient.candidacyContestationCaducite.create({
        data: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          certificationAuthorityContestationDecision:
            CertificationAuthorityContestationDecision.DECISION_PENDING,
        },
      });

      const createContestationPromise = createCandidacyContestationCaducite({
        input: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          readyForJuryEstimatedAt: FUTURE_DATE,
        },
        context: CONTEXT,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La caducité de la candidature a été confirmée ou est en attente de décision",
      );
    });

    test("should fail when caducity has been confirmed", async () => {
      const candidacy = await createCandidacyHelper();

      await prismaClient.candidacyContestationCaducite.create({
        data: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          certificationAuthorityContestationDecision:
            CertificationAuthorityContestationDecision.CADUCITE_CONFIRMED,
        },
      });

      const createContestationPromise = createCandidacyContestationCaducite({
        input: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          readyForJuryEstimatedAt: FUTURE_DATE,
        },
        context: CONTEXT,
      });

      await expect(createContestationPromise).rejects.toThrow(
        "La caducité de la candidature a été confirmée ou est en attente de décision",
      );
    });
  });

  describe("Successful creation", () => {
    test("should successfully create a contestation and update readyForJuryEstimatedAt", async () => {
      const candidacy = await createCandidacyHelper();

      const result = await createCandidacyContestationCaducite({
        input: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          readyForJuryEstimatedAt: FUTURE_DATE,
        },
        context: CONTEXT,
      });

      expect(result).toMatchObject({
        candidacyId: candidacy.id,
        contestationReason: VALID_CONTESTATION_REASON,
      });

      const updatedCandidacy = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updatedCandidacy?.readyForJuryEstimatedAt?.getTime()).toBe(
        FUTURE_DATE.getTime(),
      );
    });

    test("should allow new contestation when previous one was invalidated", async () => {
      const candidacy = await createCandidacyHelper();

      await prismaClient.candidacyContestationCaducite.create({
        data: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          certificationAuthorityContestationDecision:
            CertificationAuthorityContestationDecision.CADUCITE_INVALIDATED,
        },
      });

      const result = await createCandidacyContestationCaducite({
        input: {
          candidacyId: candidacy.id,
          contestationReason: VALID_CONTESTATION_REASON,
          readyForJuryEstimatedAt: FUTURE_DATE,
        },
        context: CONTEXT,
      });

      expect(result).toMatchObject({
        candidacyId: candidacy.id,
        contestationReason: VALID_CONTESTATION_REASON,
      });
    });
  });

  describe("Security", () => {
    test("should allow candidate to create contestation for their own candidacy", async () => {
      const candidacy = await createCandidacyHelper();

      const resp = await createContestationMutation({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        contestationReason: VALID_CONTESTATION_REASON,
        readyForJuryEstimatedAt: FUTURE_DATE,
      });

      expect(resp.statusCode).toEqual(200);
      expect(
        resp.json().data.candidacy_contestation_caducite_create_contestation,
      ).toMatchObject({
        contestationReason: VALID_CONTESTATION_REASON,
      });
    });

    test("should not allow candidate to create contestation for another candidacy", async () => {
      const candidacy = await createCandidacyHelper();
      const otherCandidacy = await createCandidacyHelper();

      const resp = await createContestationMutation({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: otherCandidacy.id,
        contestationReason: VALID_CONTESTATION_REASON,
        readyForJuryEstimatedAt: FUTURE_DATE,
      });

      expect(resp.statusCode).toEqual(200);
      expect(resp.json().errors?.[0].message).toEqual(
        "Vous n'êtes pas autorisé à accéder à cette candidature",
      );
    });
  });
});
