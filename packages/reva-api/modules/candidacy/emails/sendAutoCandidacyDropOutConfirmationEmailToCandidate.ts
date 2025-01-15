import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendAutoCandidacyDropOutConfirmationEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
}: {
  candidateEmail: string;
  candidateFullName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <div>Bonjour ${candidateFullName},</div>
      <p>Votre AAP a déclaré votre abandon il y a 6 mois. Parce que vous n’avez pas contesté cette décision, l'abandon est confirmé automatiquement 
      et votre parcours VAE s’arrête ici.</p>
      <p>Si vous souhaitez en savoir plus, contactez votre accompagnateur ou le support France VAE à support@vae.gouv.fr.</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email: candidateEmail },
    htmlContent: htmlContent.html,
    subject: "Abandon confirmé automatiquement",
  });
};
