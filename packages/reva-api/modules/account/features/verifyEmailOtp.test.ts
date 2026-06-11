import { prismaClient } from "@/prisma/client";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";

import { verifyEmailOtp } from "./verifyEmailOtp";

const seedOtp = async (accountId: string, otp: string) =>
  prismaClient.accountEmailOtp.create({ data: { accountId, otp } });

describe("verifyEmailOtp", () => {
  test("accepts a valid OTP and deletes the record", async () => {
    const account = await createAccountHelper();
    await seedOtp(account.id, "123456");

    await expect(
      verifyEmailOtp({ accountId: account.id, userOtp: "123456" }),
    ).resolves.toBeUndefined();

    const remaining = await prismaClient.accountEmailOtp.findUnique({
      where: { accountId: account.id },
    });
    expect(remaining).toBeNull();
  });

  test("throws when the OTP is incorrect", async () => {
    const account = await createAccountHelper();
    await seedOtp(account.id, "123456");

    await expect(
      verifyEmailOtp({ accountId: account.id, userOtp: "000000" }),
    ).rejects.toThrow("OTP non valide");
  });

  test("throws when no OTP exists for the account", async () => {
    const account = await createAccountHelper();

    await expect(
      verifyEmailOtp({ accountId: account.id, userOtp: "123456" }),
    ).rejects.toThrow("OTP non trouvé");
  });
});
