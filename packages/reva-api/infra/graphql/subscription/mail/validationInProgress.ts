import mjml2html from "mjml";
import { Left, Right } from "purify-ts";

import { sendGenericEmail } from "../../../email";
import { logger } from "../../../logger";
import { template } from "./template";

export const sendSubscriptionValidationInProgressEmail = async ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = mjml2html(
    template({
      headline: "",
      message: `Votre demande de création de compte a bien été enregistrée.
        <p>L’équipe France VAE va analyser votre inscription. Cela peut prendre quelques jours.</p>
        <p>Une fois celle-ci validée, vous recevrez un e-mail contenant un lien d'activation qui sera valable pendant 4 jours.</p>
        <p>Si vous ne l’avez pas déjà fait, nous vous invitons à <a href="https://tally.so/r/mVjVeN" target="_blank">participer à un de nos webinaires de présentation de France VAE</a>.</p>
        <p>Si des questions subsistent, n'hésitez pas à nous contacter via la messagerie instantanée ou par e-mail à <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
        <p>L’équipe France VAE.</p>
      `,
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
    return Right("ok");
  }
  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre compte professionnel France VAE est en cours de validation",
  });
};
