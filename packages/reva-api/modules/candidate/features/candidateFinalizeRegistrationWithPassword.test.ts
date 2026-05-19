import { faker } from "@faker-js/faker";

import * as AuthHelper from "@/modules/shared/auth/auth.helper";
import * as JwtHelper from "@/modules/shared/auth/jwt.helper";
import { prismaClient } from "@/prisma/client";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";
import * as CandidateKeycloakUtils from "../utils/keycloak.utils";

const resetPasswordMutation = graphql(`
  mutation candidate_resetPassword_finalize_registration_test(
    $token: String!
    $password: String!
  ) {
    candidate_resetPassword(token: $token, password: $password) {
      accessToken
      refreshToken
      idToken
    }
  }
`);

describe("candidateFinalizeRegistrationWithPassword", () => {
  test("creates candidate without candidacy then returns tokens", async () => {
    const graphqlClient = getGraphQLClient({});
    const email = faker.internet.email();
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const token = JwtHelper.generateJwt({
      email,
      action: "finalize-registration",
    });

    vi.spyOn(JwtHelper, "getJWTContent").mockReturnValue({
      email,
      action: "finalize-registration",
    });

    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue(null);

    const createAccountSpy = vi
      .spyOn(AuthHelper, "createAccountInIAM")
      .mockResolvedValue(keycloakId);

    const resetPasswordSpy = vi
      .spyOn(AuthHelper, "resetPassword")
      .mockResolvedValue(undefined);

    const tokens = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      idToken: "id-token",
    };

    const generateTokensSpy = vi
      .spyOn(CandidateKeycloakUtils, "generateCandidateIAMTokenWithPassword")
      .mockResolvedValue(tokens);

    const result = await graphqlClient.request(resetPasswordMutation, {
      token,
      password,
    });

    expect(result.candidate_resetPassword).toEqual(tokens);

    expect(createAccountSpy).toHaveBeenCalledWith(
      { email },
      process.env.KEYCLOAK_APP_REALM,
    );
    expect(resetPasswordSpy).toHaveBeenCalledWith(
      keycloakId,
      password,
      process.env.KEYCLOAK_APP_REALM,
    );
    expect(generateTokensSpy).toHaveBeenCalledWith(keycloakId, password);

    const candidate = await prismaClient.candidate.findUnique({
      where: { email },
    });

    expect(candidate).not.toBeNull();
    expect(candidate?.keycloakId).toBe(keycloakId);
    expect(candidate?.firstname).toBe("");
    expect(candidate?.lastname).toBe("");

    const candidacy = await prismaClient.candidacy.findFirst({
      where: { candidateId: candidate?.id },
    });

    expect(candidacy).toBeNull();
  });

  test("resets password when an IAM account already exists without TOTP", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const existingCandidate = await createCandidateHelper({
      keycloakId,
    });
    const token = JwtHelper.generateJwt({
      email: existingCandidate.email,
      action: "finalize-registration",
    });

    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue({
      id: keycloakId,
    });

    const createAccountSpy = vi.spyOn(AuthHelper, "createAccountInIAM");
    const resetPasswordSpy = vi
      .spyOn(AuthHelper, "resetPassword")
      .mockResolvedValue(undefined);

    vi.spyOn(
      CandidateKeycloakUtils,
      "candidateUserHasTotpConfigured",
    ).mockResolvedValue(false);

    const tokens = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      idToken: "id-token",
    };

    const generateTokensSpy = vi
      .spyOn(CandidateKeycloakUtils, "generateCandidateIAMTokenWithPassword")
      .mockResolvedValue(tokens);

    const result = await graphqlClient.request(resetPasswordMutation, {
      token,
      password,
    });

    expect(createAccountSpy).not.toHaveBeenCalled();
    expect(resetPasswordSpy).toHaveBeenCalledWith(
      keycloakId,
      password,
      process.env.KEYCLOAK_APP_REALM,
    );
    expect(generateTokensSpy).toHaveBeenCalledWith(keycloakId, password);
    expect(result.candidate_resetPassword).toEqual(tokens);

    const updatedCandidate = await prismaClient.candidate.findUnique({
      where: { id: existingCandidate.id },
    });

    expect(updatedCandidate?.passwordUpdatedAt).not.toBeNull();
  });

  test("existing account with TOTP enrolled: returns null, skips auto-login, still updates passwordUpdatedAt", async () => {
    const graphqlClient = getGraphQLClient({});
    const password = "StrongPassword123!";
    const keycloakId = faker.string.uuid();
    const existingCandidate = await createCandidateHelper({
      keycloakId,
    });
    const token = JwtHelper.generateJwt({
      email: existingCandidate.email,
      action: "finalize-registration",
    });

    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue({
      id: keycloakId,
    });

    vi.spyOn(AuthHelper, "resetPassword").mockResolvedValue(undefined);

    vi.spyOn(
      CandidateKeycloakUtils,
      "candidateUserHasTotpConfigured",
    ).mockResolvedValue(true);

    const generateTokensSpy = vi.spyOn(
      CandidateKeycloakUtils,
      "generateCandidateIAMTokenWithPassword",
    );

    const result = await graphqlClient.request(resetPasswordMutation, {
      token,
      password,
    });

    expect(result.candidate_resetPassword).toBeNull();
    expect(generateTokensSpy).not.toHaveBeenCalled();

    const updatedCandidate = await prismaClient.candidate.findUnique({
      where: { id: existingCandidate.id },
    });

    expect(updatedCandidate?.passwordUpdatedAt).not.toBeNull();
  });
});
