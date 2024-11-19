import { sendGenericEmail } from ".";
import { logger } from "../logger";

export const sendEmailWithLink = async ({
  to,
  token,
  action = "",
  app,
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
    | "agencies-settings-v3"
    | "";
  customUrl?: string;
  app: "candidate" | "admin";
  htmlContent: (url: string) => { html: string };
  subject?: string;
  attachment?: { name: string; content: string }[];
}) => {
  let appPath = "no_app_defined";
  switch (app) {
    case "candidate":
      appPath = "candidat";
      break;
    case "admin":
      appPath = "admin2";
      break;
  }
  const actionPath =
    action == "registration" || action == "confirmEmail" ? "login" : action;

  const baseUrl = `${process.env.BASE_URL}/${appPath}`;
  const url = customUrl
    ? `${baseUrl}${customUrl}`
    : `${baseUrl}/${actionPath}${token ? `?token=${token}` : ""}`;
  const emailContent = htmlContent(url);

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
  ) {
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
