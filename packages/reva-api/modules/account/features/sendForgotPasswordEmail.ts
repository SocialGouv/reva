import { generateJwt } from "@/modules/shared/auth/auth.helper";
import { sendEmailUsingTemplate } from "@/modules/shared/email";
import { prismaClient } from "@/prisma/client";

import { ClientApp } from "../account.type";

export const sendForgotPasswordEmail = async ({
  email,
  clientApp,
}: {
  email: string;
  clientApp: ClientApp;
}) => {
  const accountExists = !!(await prismaClient.account.count({
    where: {
      email: email,
    },
  }));

  if (accountExists) {
    const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";
    const token = generateJwt({ email, action: "reset-password" }, 4 * 60 * 60);

    let resetPasswordUrlPath = "";
    switch (clientApp) {
      case "REVA_VAE_COLLECTIVE":
        resetPasswordUrlPath = "/vae-collective/reset-password";
        break;
      default:
        throw new Error("Application non reconnue");
    }

    const url = new URL(
      `${resetPasswordUrlPath}?resetPasswordToken=${token}`,
      baseUrl,
    );

    return sendEmailUsingTemplate({
      to: { email },
      templateId: 595,
      params: {
        resetPasswordUrl: url.toString(),
      },
    });
  }
};
