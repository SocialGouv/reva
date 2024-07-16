import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

const baseUrl =
  process.env.ELM_ADMIN_BASE_URL ||
  process.env.APP_BASE_URL ||
  "https://vae.gouv.fr";

export const sendJuryScheduledAAPEmail = async ({
  candidacyId,
  email,
  candidateFullName,
}: {
  candidacyId: string;
  email: string;
  candidateFullName: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Nous avons le plaisir de vous informer que la convocation pour votre candidat, ${candidateFullName}, est prête et lui sera très bientôt envoyée.  Vous pourrez retrouver les informations relatives à son passage (date et heure de passage) dans votre espace. </p>
    `,
        labelCTA: "Accéder aux informations jury",
        bottomLine: `
      <p>Nous restons à votre disposition pour toute question ou besoin d'assistance supplémentaire. </p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE.</p>
      `,
        url,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Convocation de passage en jury pour un de vos candidats",
    customUrl: `${baseUrl}/admin2/candidacies/${candidacyId}/jury-aap`,
  });
};
