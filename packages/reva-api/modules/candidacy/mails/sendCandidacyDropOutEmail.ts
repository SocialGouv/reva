import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendCandidacyDropOutEmail = async (email: string) => {
  const htmlContent = mjml2html(
    templateMail({
      headlineDsfr: `<div>Votre accompagnateur a déclaré votre abandon de candidature</div>`,
      content: `
      <p>Nous vous informons que dans le cadre de votre parcours de VAE, votre conseiller a placé votre candidature en abandon.</p>
      <p>Si vous souhaitez contester cette décision veuillez nous contacter rapidement sur le mail <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
      <p>Sans retour de votre part, l’abandon sera effectif dans un délai de 15 jours à compter de la réception de ce message.</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre accompagnateur a déclaré votre abandon de candidature",
  });
};
