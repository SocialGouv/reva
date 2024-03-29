import { Right } from "purify-ts";
import { sendGenericEmailPurifyJS } from ".";
import { logger } from "../logger";

export const sendEmailWithLinkPurifyJS = async ({
  email,
  token,
  action,
  app = "app",
  htmlContent,
  subject,
}: {
  email: string;
  token?: string;
  action: "registration" | "login" | "confirmEmail" | "admin" | "";
  app?: "app" | "admin";
  htmlContent: (url: string) => { html: string };
  subject?: string;
}) => {
  const url = `${process.env.BASE_URL}/${app}/${action}${
    token ? `?token=${token}` : ""
  }`;
  const emailContent = htmlContent(url);

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL URL =======");
    logger.info(url);
    logger.info("=========================");
    return Right("result");
  }
  return sendGenericEmailPurifyJS({
    htmlContent: emailContent.html,
    to: { email },
    subject: subject || "Votre accès à votre parcours France VAE",
  });
};
