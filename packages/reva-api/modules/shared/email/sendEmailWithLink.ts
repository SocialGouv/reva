import { logger } from "../logger";
import { sendGenericEmail } from ".";

export const sendEmailWithLink = async ({
  to,
  token,
  action = "",
  app = "app",
  htmlContent,
  subject,
  customUrl,
  attachment,
}: {
  to: { email: string } | { email: string }[];
  token?: string;
  action?:
    | "registration"
    | "login"
    | "confirmEmail"
    | "admin"
    | "agencies-settings/legal-information"
    | "";
  customUrl?: string;
  app?: "app" | "admin" | "admin2";
  htmlContent: (url: string) => { html: string };
  subject?: string;
  attachment?: { name: string; content: string }[];
}) => {
  const appPath = app == "app" ? "candidat" : app;
  const actionPath =
    action == "registration" || action == "confirmEmail" ? "login" : action;

  const baseUrl = `${process.env.BASE_URL}/${appPath}`;
  const url = customUrl
    ? `${baseUrl}${customUrl}`
    : `${baseUrl}/${actionPath}${token ? `?token=${token}` : ""}`;
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
    attachment,
  });
};
