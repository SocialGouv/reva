import mjml2html from "mjml";
import { Left, Right } from "purify-ts";

import { logger } from "../../../infra/logger";
import { sendGenericEmail } from "../../shared/email";
import { template } from "./template";

export const sendRejectionEmail = async ({
  email,
  reason,
}: {
  email: string;
  reason: string;
}) => {
  const htmlContent = mjml2html(
    template({
      headline: "Bonjour,",
      message: `<p>Nous vous remercions pour votre demande de référencement en tant qu'Architecte Accompagnateur de Parcours (AAP) sur la plateforme France VAE.</p>
        <p>Après vérification des éléments fournis concernant votre structure, nous ne pouvons malheureusement pas valider votre référencement.</p>
        <p>Nous avons constaté les erreurs suivantes :</p>
        <ul>${reason
          .split("\n")
          .map((line: string) => `<li>${line}</li>`)
          .join("")}
        </ul>
        <p>Nous vous invitons à recommencer votre inscription en corrigeant ces points.</p>
        <p>Si vous ne l’avez pas déjà fait, nous vous invitons à <a href="https://tally.so/r/mVjVeN">participer à un de nos webinaires de présentation de France VAE</a>.</p>
        <p>Si des questions subsistent, n'hésitez pas à nous contacter via la messagerie instantanée ou par email à <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
        <p>Très cordialement</p>
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
    subject: "Votre inscription France VAE a été invalidée",
  });
};
