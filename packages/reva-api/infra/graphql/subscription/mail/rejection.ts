import mjml2html from "mjml";
import { Left, Right } from "purify-ts";

import { sendGenericEmail } from "../../../email";
import { logger } from "../../../logger";
import { template } from "./template";

export const sendRejectionEmail = async (
  email: string,
  subscriptionRequestUri?: string,
  reasons?: string[]
) => {
  const htmlContent = mjml2html(
    template({
      headline: "Navré,",
      message:
        "Votre compte Reva n’a pas pu être vérifié pour les raisons suivantes:",
      cta: subscriptionRequestUri
        ? {
            label: "Consulter ma demande",
            url: `${
              process.env.BASE_URL ?? "https://reva.beta.gouv.fr"
            }${subscriptionRequestUri}`,
          }
        : undefined,
      details: reasons,
    })
  );

  if (htmlContent.errors.length > 0) {
    const errorMessage = htmlContent.errors
      .map((e) => e.formattedMessage)
      .join("\n");
    logger.error(errorMessage);
    return Left("MJML parse error");
  }

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent.html);
    logger.info("=========================");
    logger.info("======= EMAIL URL =======");
    logger.info(subscriptionRequestUri);
    logger.info("=========================");
    return Right(subscriptionRequestUri ?? "ok");
  }
  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre compte Reva",
  });
};
