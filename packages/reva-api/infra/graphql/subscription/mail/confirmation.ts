import mjml2html from "mjml";
import { Right } from "purify-ts";

import { sendGenericEmail } from "../../../email";
import { logger } from "../../../logger";
import { template } from "./template";

export const sendConfirmationEmail = async (
  email: string,
  iamLinkUrl?: string
) => {
  const htmlContent = mjml2html(
    template({
      headline: "Félicitations !",
      message: "Votre compte Reva vient d'être vérifié. Vous pouvez accéder dès à présent à votre espace professionnel !",
      cta: iamLinkUrl
        ? {
            label: "Activer mon compte",
            url: iamLinkUrl,
          }
        : undefined,
    })
  );
  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent.html);
    logger.info("=========================");
    logger.info("======= EMAIL URL =======");
    logger.info(iamLinkUrl);
    logger.info("=========================");
    return Right(iamLinkUrl ?? "ok");
  }
  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre compte Reva",
  });
};
