import * as EmailModule from "@/modules/shared/email/sendEmailUsingTemplate";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";

import { resendEmailOtp } from "./resendEmailOtp";

describe("resendEmailOtp", () => {
  beforeEach(() => {
    vi.stubEnv("ACCOUNT_EMAIL_OTP_SECRET", "CKMZM3G2M57BEUMFRKLTVYSR26YIKASD");
    vi.spyOn(EmailModule, "sendEmailUsingTemplate").mockResolvedValue(
      undefined,
    );
  });

  test("sends a new OTP email when the account exists", async () => {
    const account = await createAccountHelper();
    const sendEmailSpy = vi.spyOn(EmailModule, "sendEmailUsingTemplate");

    await expect(
      resendEmailOtp({ email: account.email }),
    ).resolves.toBeUndefined();

    expect(sendEmailSpy).toHaveBeenCalledOnce();
  });

  test("throws when no account matches the email", async () => {
    await expect(
      resendEmailOtp({ email: "unknown@example.com" }),
    ).rejects.toThrow("Compte non trouvé");
  });
});
