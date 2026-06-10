import * as EmailModule from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";

import { sendEmailOtp } from "./sendEmailOtp";

vi.mock("otplib", () => ({ generate: vi.fn() }));

describe("sendEmailOtp", () => {
  let sendEmailSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("ACCOUNT_EMAIL_OTP_SECRET", "CKMZM3G2M57BEUMFRKLTVYSR26YIKASD");
    sendEmailSpy = vi
      .spyOn(EmailModule, "sendEmailUsingTemplate")
      .mockResolvedValue(undefined);
  });

  test("generates an OTP, persists it in the database, and sends the email", async () => {
    const account = await createAccountHelper();

    await sendEmailOtp({ accountId: account.id });

    const stored = await prismaClient.accountEmailOtp.findFirst({
      where: { accountId: account.id },
    });
    expect(stored?.otp).toMatch(/^\d{6}$/);

    expect(sendEmailSpy).toHaveBeenCalledOnce();
    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: { email: account.email },
      templateId: 711,
      params: { otp: stored?.otp },
    });
  });

  test("replaces an existing OTP instead of creating a second one", async () => {
    const account = await createAccountHelper();

    await sendEmailOtp({ accountId: account.id });
    await sendEmailOtp({ accountId: account.id });

    const otps = await prismaClient.accountEmailOtp.findMany({
      where: { accountId: account.id },
    });
    expect(otps).toHaveLength(1);
  });

  test("throws when the account does not exist", async () => {
    await expect(
      sendEmailOtp({ accountId: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow("Compte utilisateur non trouvé");
  });

  test("throws when ACCOUNT_EMAIL_OTP_SECRET is not set", async () => {
    vi.stubEnv("ACCOUNT_EMAIL_OTP_SECRET", "");
    const account = await createAccountHelper();

    await expect(sendEmailOtp({ accountId: account.id })).rejects.toThrow(
      "ACCOUNT_EMAIL_OTP_SECRET non défini",
    );
  });

  test("does not send the email if persistence fails", async () => {
    const account = await createAccountHelper();

    vi.spyOn(prismaClient, "$transaction").mockRejectedValueOnce(
      new Error("DB error"),
    );

    await expect(sendEmailOtp({ accountId: account.id })).rejects.toThrow(
      "DB error",
    );
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });
});
