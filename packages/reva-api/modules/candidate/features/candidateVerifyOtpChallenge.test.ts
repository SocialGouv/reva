import { faker } from "@faker-js/faker";

import { KeycloakUnavailableError } from "@/modules/shared/auth/keycloak-token.utils";
import { encodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";
import { prismaClient } from "@/prisma/client";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";
import * as CandidateKeycloakUtils from "../utils/keycloak.utils";

const verifyOtpMutation = graphql(`
  mutation candidate_verifyOtpChallenge_test(
    $challengeToken: String!
    $totp: String!
  ) {
    candidate_verifyOtpChallenge(challengeToken: $challengeToken, totp: $totp) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
      candidate {
        id
      }
      requiresOtp
      otpChallengeToken
    }
  }
`);

const ORIGINAL_ENV = { ...process.env };

beforeAll(() => {
  process.env.JWT_PRIVATE_KEY = "test-jwt-private-key";
  process.env.DATA_ENCRYPT_PRIVATE_KEY = "test-data-encrypt-private-key";
  process.env.KEYCLOAK_APP_REALM = "reva-app";
  process.env.KEYCLOAK_APP_REVA_APP = "reva-app";
});

afterAll(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("candidateVerifyOtpChallenge", () => {
  test("happy path: valid challenge + valid totp returns tokens and updates lastLoginViaPasswordAt", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const candidate = await createCandidateHelper({
      keycloakId,
      lastLoginViaPasswordAt: null,
    });

    const challengeToken = encodeOtpChallengeToken({
      payload: {
        keycloakId,
        realm: "reva-app",
        clientId: "reva-app",
        password,
      },
      otpType: "authenticator",
    });

    const tokens = {
      accessToken: "AT",
      refreshToken: "RT",
      idToken: "IT",
    };
    vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    ).mockResolvedValue(tokens);

    const result = await graphqlClient.request(verifyOtpMutation, {
      challengeToken,
      totp: "123456",
    });

    expect(result.candidate_verifyOtpChallenge.tokens).toEqual(tokens);
    expect(result.candidate_verifyOtpChallenge.candidate.id).toBe(candidate.id);
    expect(result.candidate_verifyOtpChallenge.requiresOtp).toBe(false);
    expect(result.candidate_verifyOtpChallenge.otpChallengeToken).toBeNull();

    const refreshed = await prismaClient.candidate.findUnique({
      where: { id: candidate.id },
    });
    expect(refreshed?.lastLoginViaPasswordAt).not.toBeNull();
  });

  test("tampered challenge token returns 'Session de vérification expirée'", async () => {
    const graphqlClient = getGraphQLClient({});

    await expect(
      graphqlClient.request(verifyOtpMutation, {
        challengeToken: "this-is-not-a-valid-jwt",
        totp: "123456",
      }),
    ).rejects.toThrow("Session de vérification expirée");
  });

  test("wrong totp returns 'Code de vérification (OTP) invalide'", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    await createCandidateHelper({ keycloakId });

    const challengeToken = encodeOtpChallengeToken({
      payload: {
        keycloakId,
        realm: "reva-app",
        clientId: "reva-app",
        password,
      },
      otpType: "authenticator",
    });

    vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    ).mockRejectedValue(new Error("Code de vérification (OTP) invalide"));

    await expect(
      graphqlClient.request(verifyOtpMutation, {
        challengeToken,
        totp: "000000",
      }),
    ).rejects.toThrow("Code de vérification (OTP) invalide");
  });

  test("Keycloak unavailable: surfaces KEYCLOAK_UNAVAILABLE error message", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    await createCandidateHelper({ keycloakId });

    const challengeToken = encodeOtpChallengeToken({
      payload: {
        keycloakId,
        realm: "reva-app",
        clientId: "reva-app",
        password,
      },
      otpType: "authenticator",
    });

    vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    ).mockRejectedValue(new KeycloakUnavailableError());

    await expect(
      graphqlClient.request(verifyOtpMutation, {
        challengeToken,
        totp: "123456",
      }),
    ).rejects.toThrow("Service d'authentification indisponible");
  });

  test("lastLoginViaPasswordAt is NOT updated when mint fails", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const candidate = await createCandidateHelper({
      keycloakId,
      lastLoginViaPasswordAt: null,
    });

    const challengeToken = encodeOtpChallengeToken({
      payload: {
        keycloakId,
        realm: "reva-app",
        clientId: "reva-app",
        password,
      },
      otpType: "authenticator",
    });

    vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    ).mockRejectedValue(new Error("Code de vérification (OTP) invalide"));

    await expect(
      graphqlClient.request(verifyOtpMutation, {
        challengeToken,
        totp: "000000",
      }),
    ).rejects.toThrow();

    const refreshed = await prismaClient.candidate.findUnique({
      where: { id: candidate.id },
    });
    expect(refreshed?.lastLoginViaPasswordAt).toBeNull();
  });
});
