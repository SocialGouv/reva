import { generateJwt } from "@/modules/shared/auth/jwt.helper";
import {
  ADMIN_BASE_URL,
  VAE_COLLECTIVE_BASE_URL,
} from "@/modules/shared/config/config";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

import { ClientApp } from "../account.type";

import { getAccountByEmail } from "./getAccountByEmail";

const RESET_PASSWORD_URL_PATH_BY_CLIENT_APP: Record<ClientApp, string> = {
  REVA_ADMIN: `${ADMIN_BASE_URL}/reset-password`,
  REVA_VAE_COLLECTIVE: `${VAE_COLLECTIVE_BASE_URL}/reset-password`,
};

export const sendForgotPasswordEmail = async ({
  email,
  clientApp,
}: {
  email: string;
  clientApp: ClientApp;
}) => {
  const resetPasswordUrlPath = RESET_PASSWORD_URL_PATH_BY_CLIENT_APP[clientApp];
  if (!resetPasswordUrlPath) throw new Error("Application non reconnue");

  const account = await getAccountByEmail(email);

  if (!account) return;

  const token = generateJwt({ email, action: "reset-password" }, 4 * 60 * 60);
  const resetPasswordUrl = `${resetPasswordUrlPath}?resetPasswordToken=${token}`;

  return sendEmailUsingTemplate({
    to: { email },
    templateId: 595,
    params: {
      resetPasswordUrl,
    },
  });
};
