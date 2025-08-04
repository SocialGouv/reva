import { generateJwt } from "@/modules/shared/auth/auth.helper";
import { sendEmailUsingTemplate } from "@/modules/shared/email";
import { prismaClient } from "@/prisma/client";

export const sendForgotPasswordEmail = async ({ email }: { email: string }) => {
  const accountExists = !!(await prismaClient.account.count({
    where: {
      email: email,
    },
  }));

  if (accountExists) {
    const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";
    const token = generateJwt({ email, action: "reset-password" }, 4 * 60 * 60);
    const path = `/vae-collective/reset-password?resetPasswordToken=${token}`;
    const url = new URL(path, baseUrl);

    return sendEmailUsingTemplate({
      to: { email },
      templateId: 595,
      params: {
        resetPasswordUrl: url.toString(),
      },
    });
  }
};
