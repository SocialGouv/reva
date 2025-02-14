import mjml2html from "mjml";

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
      message: `<p>Nous vous remercions pour votre demande d’inscription en tant qu'Architecte Accompagnateur de Parcours (AAP) sur la plateforme France VAE.</p>
        <p>Après avoir examiné votre dossier, nous avons identifié certaines erreurs qui nécessitent votre attention :</p>
        <ul>${reason
          .split("\n")
          .map((line: string) => `<li>${line}</li>`)
          .join("")}
        </ul>
        <p>Nous vous recommandons de corriger ces points si vous souhaitez déposer une nouvelle demande d’inscription.</p>
        <p>Pour rappel, vous ne pouvez pas accéder à votre compte tant que votre inscription n’est pas validée.</p>
        <p>Pour toute question, vous pouvez consulter notre <a href="https://vae.gouv.fr/faq/">FAQ</a> ou nous contacter via notre <a href="https://vae.gouv.fr/nous-contacter/">formulaire de contact</a> ou encore nous écrire à <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
        <p>Cordialement,</p>
        <p>L’équipe France VAE</p>
      `,
    }),
  );

  if (htmlContent.errors.length > 0) {
    const errorMessage = htmlContent.errors
      .map((e) => e.formattedMessage)
      .join("\n");
    throw new Error(errorMessage);
  }

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Nous n’avons pas pu valider votre inscription",
  });
};
