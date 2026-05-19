import { faker } from "@faker-js/faker";

import * as AuthHelper from "@/modules/shared/auth/auth.helper";
import { prismaClient } from "@/prisma/client";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";
import * as CandidateKeycloakUtils from "../utils/keycloak.utils";

const loginMutation = graphql(`
  mutation candidate_loginWithCredentials_test(
    $email: String!
    $password: String!
  ) {
    candidate_loginWithCredentials(email: $email, password: $password) {
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

describe("candidateLoginWithCredentials", () => {
  test("happy path without OTP: returns tokens and requiresOtp=false", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const candidate = await createCandidateHelper({ keycloakId });

    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue({
      id: keycloakId,
    });

    vi.spyOn(
      CandidateKeycloakUtils,
      "validateCandidatePasswordOnly",
    ).mockResolvedValue({ ok: true });

    vi.spyOn(
      CandidateKeycloakUtils,
      "candidateUserHasTotpConfigured",
    ).mockResolvedValue(false);

    const tokens = {
      accessToken: "AT",
      refreshToken: "RT",
      idToken: "IT",
    };
    vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    ).mockResolvedValue(tokens);

    const result = await graphqlClient.request(loginMutation, {
      email: candidate.email,
      password,
    });

    expect(result.candidate_loginWithCredentials.tokens).toEqual(tokens);
    expect(result.candidate_loginWithCredentials.candidate.id).toBe(
      candidate.id,
    );
    expect(result.candidate_loginWithCredentials.requiresOtp).toBe(false);
    expect(result.candidate_loginWithCredentials.otpChallengeToken).toBeNull();

    const refreshed = await prismaClient.candidate.findUnique({
      where: { id: candidate.id },
    });
    expect(refreshed?.lastLoginViaPasswordAt).not.toBeNull();
  });

  test("user with TOTP enrolled: returns no tokens, requiresOtp=true, non-empty challenge token, lastLoginViaPasswordAt NOT updated", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const candidate = await createCandidateHelper({
      keycloakId,
      lastLoginViaPasswordAt: null,
    });

    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue({
      id: keycloakId,
    });

    vi.spyOn(
      CandidateKeycloakUtils,
      "validateCandidatePasswordOnly",
    ).mockResolvedValue({ ok: true });

    vi.spyOn(
      CandidateKeycloakUtils,
      "candidateUserHasTotpConfigured",
    ).mockResolvedValue(true);

    const generateTokensSpy = vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    );

    const result = await graphqlClient.request(loginMutation, {
      email: candidate.email,
      password,
    });

    expect(result.candidate_loginWithCredentials.tokens).toBeNull();
    expect(result.candidate_loginWithCredentials.requiresOtp).toBe(true);
    expect(
      result.candidate_loginWithCredentials.otpChallengeToken,
    ).toBeTruthy();
    expect(generateTokensSpy).not.toHaveBeenCalled();

    const refreshed = await prismaClient.candidate.findUnique({
      where: { id: candidate.id },
    });
    expect(refreshed?.lastLoginViaPasswordAt).toBeNull();
  });

  test("wrong password before OTP step: surfaces the credentials error", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "WrongPassword!";
    const keycloakId = faker.string.uuid();
    const candidate = await createCandidateHelper({ keycloakId });

    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue({
      id: keycloakId,
    });

    vi.spyOn(
      CandidateKeycloakUtils,
      "validateCandidatePasswordOnly",
    ).mockResolvedValue({ ok: false, reason: "invalid_credentials" });

    const generateTokensSpy = vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    );

    await expect(
      graphqlClient.request(loginMutation, {
        email: candidate.email,
        password,
      }),
    ).rejects.toThrow("Adresse électronique ou mot de passe incorrect");

    expect(generateTokensSpy).not.toHaveBeenCalled();
  });
});
