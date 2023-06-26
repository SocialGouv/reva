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
        Accompagnateur de Parcours (AAP) sur la plateforme France VAE.</p>
        <p>Après vérification des éléments fournis concernant votre structure,
        nous ne pouvons malheureusement pas valider votre référencement.</p>
        <p>En vue d’une meilleure appréhension des attendus et des enjeux du référencement,
        nous vous conseillons vivement de participer à un webinaire de présentation de la plateforme
        numérique du service public de la VAE. Vous trouverez sur le lien suivant le formulaire
        d’inscription à l’ensemble des webinaires proposés : <a href="https://tally.so/r/mVjVeN">
        Inscription webinaire de présentation de la plateforme numérique de la VAE</a>.</p>
        <p>Pour de plus amples informations, nous vous invitons à nous contacter à l’adresse suivante:
        support@vae.gouv.fr,
        nous vous répondrons dans les meilleurs délais.</p>
        <br/>
        <p>Très cordialement</p>
        <p>L’équipe France VAE.</p>
      `,
      cta: subscriptionRequestUri
        ? {
            label: "Consulter ma demande",
            url: `${
              process.env.BASE_URL ?? "https://vae.gouv.fr"
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
    subject: "Votre compte France VAE",
  });
};
