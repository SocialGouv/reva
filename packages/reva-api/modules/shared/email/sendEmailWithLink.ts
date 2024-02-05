import { sendGenericEmail } from ".";
import { logger } from "../logger";

export const sendEmailWithLink = async ({
  to,
  token,
  action,
  app = "app",
  htmlContent,
  subject,
  customUrl,
}: {
  to: { email: string } | { email: string }[];
  token?: string;
  action?: "registration" | "login" | "confirmEmail" | "admin" | "";
  customUrl?: string;
  app?: "app" | "admin" | "admin2";
  htmlContent: (url: string) => { html: string };
  subject?: string;
}) => {
  const baseUrl = `${process.env.BASE_URL}/${app}`;
  const url = customUrl
    ? `${baseUrl}${customUrl}`
    : `${baseUrl}/${action}${token ? `?token=${token}` : ""}`;
  const emailContent = htmlContent(url);

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL URL =======");
    logger.info(url);
    logger.info("=========================");
    return "result";
  }
  return sendGenericEmail({
    htmlContent: emailContent.html,
    to,
    subject: subject || "France VAE",
  });
};
