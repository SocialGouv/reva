import { addMinutes } from "date-fns";

import { prismaClient } from "@/prisma/client";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";

import { deleteExpiredAccountEmailOtps } from "./deleteExpiredAccountEmailOtps";

describe("deleteExpiredAccountEmailOtps", () => {
  test("deletes OTPs older than 10 minutes", async () => {
    const account = await createAccountHelper();
    await prismaClient.accountEmailOtp.create({
      data: {
        accountId: account.id,
        otp: "123456",
        createdAt: addMinutes(new Date(), -10),
      },
    });

    await deleteExpiredAccountEmailOtps();

    const remaining = await prismaClient.accountEmailOtp.findFirst({
      where: { accountId: account.id },
    });
    expect(remaining).toBeNull();
  });

  test("keeps OTPs that are not yet expired", async () => {
    const account = await createAccountHelper();
    await prismaClient.accountEmailOtp.create({
      data: {
        accountId: account.id,
        otp: "654321",
        createdAt: addMinutes(new Date(), -9),
      },
    });

    await deleteExpiredAccountEmailOtps();

    const remaining = await prismaClient.accountEmailOtp.findFirst({
      where: { accountId: account.id },
    });
    expect(remaining).not.toBeNull();
  });

  test("deletes only expired OTPs when both kinds exist", async () => {
    const expiredAccount = await createAccountHelper();
    const freshAccount = await createAccountHelper();

    await prismaClient.accountEmailOtp.create({
      data: {
        accountId: expiredAccount.id,
        otp: "111111",
        createdAt: addMinutes(new Date(), -15),
      },
    });
    await prismaClient.accountEmailOtp.create({
      data: {
        accountId: freshAccount.id,
        otp: "222222",
        createdAt: addMinutes(new Date(), -2),
      },
    });

    await deleteExpiredAccountEmailOtps();

    const expired = await prismaClient.accountEmailOtp.findFirst({
      where: { accountId: expiredAccount.id },
    });
    const fresh = await prismaClient.accountEmailOtp.findFirst({
      where: { accountId: freshAccount.id },
    });

    expect(expired).toBeNull();
    expect(fresh).not.toBeNull();
  });
});
