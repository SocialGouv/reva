import { Right } from "purify-ts";

import { logger } from "../logger";
import { sendGenericEmailPurifyJS } from ".";
import { getFeatureByKey } from "../../feature-flipping/feature-flipping.features";

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
  const isRevaCandidateActive = (await getFeatureByKey("REVA_CANDIDATE"))
    ?.isActive;

  const appPath = isRevaCandidateActive && app == "app" ? "candidat" : app;
  const actionPath =
    isRevaCandidateActive &&
    (action == "registration" || action == "confirmEmail")
      ? "api/login"
      : action;

  const url = `${process.env.BASE_URL}/${appPath}/${actionPath}${
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
