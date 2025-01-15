import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendCandidacyDropOutConfirmedEmailToCandidate = async ({
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
      <p>Vous avez récemment accepté la décision de votre accompagnateur concernant l’abandon de votre parcours VAE. 
      Nous vous informons que ce choix a bien été enregistré et transmis à l’accompagnateur par mail.</p>
      <p>Bonne continuation !</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email: candidateEmail },
    htmlContent: htmlContent.html,
    subject: "Confirmation de votre abandon de parcours VAE",
  });
};
