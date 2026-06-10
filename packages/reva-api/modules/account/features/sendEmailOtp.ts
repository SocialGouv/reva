import { generate } from "otplib";

import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";

import { getAccountById } from "./getAccount";

export const sendEmailOtp = async ({ accountId }: { accountId: string }) => {
  const account = await getAccountById({ id: accountId });
  if (!account) {
    throw new Error("Compte utilisateur non trouvé");
  }

  const otpSecret = process.env.ACCOUNT_EMAIL_OTP_SECRET;

  if (!otpSecret) {
    throw new Error("ACCOUNT_EMAIL_OTP_SECRET non défini");
  }

  const counter = (
    await prismaClient.$queryRaw<
      {
        nextval: number;
      }[]
    >`SELECT nextval('account_otp_counter_seq')`
  )[0].nextval;

  const otp = await generate({ strategy: "hotp", counter, secret: otpSecret });

  await prismaClient.$transaction([
    prismaClient.accountEmailOtp.deleteMany({
      where: {
        accountId,
      },
    }),
    prismaClient.accountEmailOtp.create({
      data: {
        accountId,
        otp,
      },
    }),
  ]);

  await sendEmailUsingTemplate({
    to: { email: account.email },
    templateId: 711,
    params: { otp },
  });
};
