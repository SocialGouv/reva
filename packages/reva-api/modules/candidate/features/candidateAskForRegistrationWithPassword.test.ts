import * as AuthHelper from "@/modules/shared/auth/auth.helper";
import { createFeatureHelper } from "@/test/helpers/entities/create-feature-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";
import * as LoginEmailModule from "../emails/sendLoginEmail";
import * as RegistrationEmailModule from "../emails/sendRegistrationWithPasswordEmail";

const askForRegistrationWithPasswordMutation = graphql(`
  mutation candidate_askForRegistrationWithPassword_test($email: String!) {
    candidate_askForRegistrationWithPassword(email: $email)
  }
`);

describe("candidateAskForRegistrationWithPassword", () => {
  test("sends registration email when no IAM account exists", async () => {
    await createFeatureHelper({
      args: {
        key: "ENABLE_REGISTER_WITH_PASSWORD",
      },
    });

    const graphqlClient = getGraphQLClient({});
    const getAccountSpy = vi
      .spyOn(AuthHelper, "getAccountInIAM")
      .mockResolvedValue(null);

    const sendEmailSpy = vi
      .spyOn(RegistrationEmailModule, "sendRegistrationWithPasswordEmail")
      .mockResolvedValue(undefined);

    const loginEmailSpy = vi
      .spyOn(LoginEmailModule, "sendLoginEmail")
      .mockResolvedValue(undefined);

    const result = await graphqlClient.request(
      askForRegistrationWithPasswordMutation,
      {
        email: "alice.doe@example.com",
      },
    );

    expect(result.candidate_askForRegistrationWithPassword).toBe("ok");
    expect(getAccountSpy).toHaveBeenCalledWith(
      "alice.doe@example.com",
      process.env.KEYCLOAK_APP_REALM,
    );
    expect(sendEmailSpy).toHaveBeenCalledWith({
      email: "alice.doe@example.com",
    });
    expect(loginEmailSpy).not.toHaveBeenCalled();
  });

  test("sends login email when an IAM account already exists", async () => {
    await createFeatureHelper({
      args: {
        key: "ENABLE_REGISTER_WITH_PASSWORD",
      },
    });

    const graphqlClient = getGraphQLClient({});
    vi.spyOn(AuthHelper, "getAccountInIAM").mockResolvedValue({
      id: "existing-account",
    });

    const registrationEmailSpy = vi
      .spyOn(RegistrationEmailModule, "sendRegistrationWithPasswordEmail")
      .mockResolvedValue(undefined);

    const loginEmailSpy = vi
      .spyOn(LoginEmailModule, "sendLoginEmail")
      .mockResolvedValue(undefined);

    const result = await graphqlClient.request(
      askForRegistrationWithPasswordMutation,
      {
        email: "alice.doe@example.com",
      },
    );

    expect(result.candidate_askForRegistrationWithPassword).toBe("ok");
    expect(registrationEmailSpy).not.toHaveBeenCalled();
    expect(loginEmailSpy).toHaveBeenCalledWith("alice.doe@example.com");
  });

  test("rejects registration when password registration is disabled", async () => {
    const graphqlClient = getGraphQLClient({});
    const getAccountSpy = vi.spyOn(AuthHelper, "getAccountInIAM");

    const registrationEmailSpy = vi
      .spyOn(RegistrationEmailModule, "sendRegistrationWithPasswordEmail")
      .mockResolvedValue(undefined);

    const loginEmailSpy = vi
      .spyOn(LoginEmailModule, "sendLoginEmail")
      .mockResolvedValue(undefined);

    await expect(
      graphqlClient.request(askForRegistrationWithPasswordMutation, {
        email: "alice.doe@example.com",
      }),
    ).rejects.toThrow("L'inscription par mot de passe n'est pas activée");

    expect(getAccountSpy).not.toHaveBeenCalled();
    expect(registrationEmailSpy).not.toHaveBeenCalled();
    expect(loginEmailSpy).not.toHaveBeenCalled();
  });
});
