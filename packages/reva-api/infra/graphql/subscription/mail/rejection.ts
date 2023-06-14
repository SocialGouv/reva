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
      headline: "Bonjour,",
      message: `<p>Nous vous remercions pour votre demande de référencement en tant qu'Architecte
        Accompagnateur de Parcours (AAP) sur la plateforme Reva.</p>
        <p>Après vérification des éléments fournis concernant votre structure,
        nous ne pouvons malheureusement pas valider votre référencement.</p>
        <p>Pour de plus amples informations, nous vous invitons à nous contacter à l’adresse suivante:
        support@reva.beta.gouv.fr,
        nous vous répondrons dans les meilleurs délais.</p>
        <br/>
        <p>Très cordialement</p>
        <p>L’équipe Reva.</p>
      `,
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
