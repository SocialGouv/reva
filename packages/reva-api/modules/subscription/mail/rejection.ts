import mjml2html from "mjml";
import { Left, Right } from "purify-ts";

import { sendGenericEmailPurifyJS } from "../../shared/email";
import { logger } from "../../shared/logger";
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
      message: `<p>Nous vous remercions pour votre demande de référencement en tant qu'Architecte         Accompagnateur de Parcours (AAP) sur la plateforme France VAE.</p>
        <p>Après avoir examiné votre dossier, nous avons identifié certaines erreurs qui nécessitent votre attention :</p>
        <ul>${reason
          .split("\n")
          .map((line: string) => `<li>${line}</li>`)
          .join("")}
        </ul>
        <p>Nous vous recommandons de corriger ces points si vous souhaitez déposer une nouvelle demande d’inscription.</p>
        <p>Si vous ne l’avez pas déjà fait, nous vous invitons à <a href="https://tally.so/r/mVjVeN">participer à l’un de nos webinaires de présentation de France VAE</a>. La participation à ce webinaire est un prérequis pour être référencé !</p>
        <p>Inscrivez-vous ici : <a href="https://tally.so/r/mVjVeN">Webinaires France VAE</a>.</p>
        <p>Pour toute question, vous pouvez consulter notre <a href="https://vae.gouv.fr/faq/">FAQ</a>, nous contacter via notre <a href="https://vae.gouv.fr/nous-contacter/">formulaire de contact</a> ou encore nous écrire à <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
        <p>Cordialement</p>
        <p>L’équipe France VAE.</p>
      `,
    }),
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
  return sendGenericEmailPurifyJS({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre inscription France VAE a été invalidée",
  });
};
