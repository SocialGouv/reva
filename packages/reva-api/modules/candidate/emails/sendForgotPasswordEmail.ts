import { generateJwt } from "@/modules/shared/auth/auth.helper";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendForgotPasswordEmail = async (email: string) => {
  const baseUrl = process.env.BASE_URL || "http://localhost";
  const token = generateJwt({ email, action: "reset-password" }, 4 * 60 * 60);
  const path = `/candidat/reset-password?resetPasswordToken=${token}`;
  const url = new URL(path, baseUrl);

  return sendEmailUsingTemplate({
    to: { email },
    templateId: 595,
    params: {
      resetPasswordUrl: url.toString(),
    },
  });
};
