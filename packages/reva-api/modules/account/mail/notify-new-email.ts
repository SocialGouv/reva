import mjml2html from "mjml";
import { Right } from "purify-ts";

import { sendGenericEmail } from "../../shared/email";
import { logger } from "../../shared/logger";
import { template } from "./template";

export const notifyNewEmailAddress = async ({ email }: { email: string }) => {
  const htmlContent = mjml2html(
    template({
      message: `Bonjour,
        <p>Vous avez demandé à changer votre e-mail sur France VAE, sachez que la modification a été effectuée.</p>
        <p>Cet e-mail est désormais votre nouvel identifiant, il vous sera utile pour vous connecter à France VAE.</p>
        <p>L’équipe France VAE</p>
      `,
    })
  );

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent.html);
    logger.info("=========================");
    return Right("ok");
  }

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre e-mail sur France VAE a été changé",
  });
};
