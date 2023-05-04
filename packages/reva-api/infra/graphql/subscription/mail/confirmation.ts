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
      headline: "<p>Bonjour,</p>",
      message: `<p>Nous vous remercions pour votre référencement en tant qu'Architecte Accompagnateur
        de Parcours (AAP) sur la plateforme France VAE.</p>
        <p>Nous vous invitons désormais à vous rendre sur **[francevae.gouv.fr/comptepro](http://francevae.gouv.fr/comptepro)**
        et saisir vos identifiants pour accéder à votre compte. Vous pouvez désormais compléter votre espace professionnel
        à l’aide de la documentation mise à disposition.</p>
        <p>N'hésitez pas à nous contacter via la messagerie instantanée présente dans votre back office ou par email à
        **[support@francevae.gouv.fr](mailto:support@francevae.gouv.fr)**.</p>
        <br/>
        <p>Cordialement,</p>
        <p>L’équipe France VAE.</p>
      `,
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
