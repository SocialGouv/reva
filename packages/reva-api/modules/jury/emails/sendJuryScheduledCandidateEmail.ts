import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendJuryScheduledCandidateEmail = async ({
  email,
  convocationFile,
}: {
  email: string;
  convocationFile?: UploadedFile;
}) => {
  const attachment = convocationFile
    ? [
        {
          name: convocationFile.filename,
          content: convocationFile._buf.toString("base64"),
        },
      ]
    : undefined;

  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 523,
      params: {
        candidateAppUrl: getCandidateAppUrl(),
        convocationFilePresent: !!convocationFile,
      },
      attachment,
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
      <p>Bonjour,</p>
      <p>La date de votre passage devant un jury VAE a été planifiée et est disponible dans votre espace candidat.</p>
    `,
          labelCTA: "Accéder à mon espace",
          bottomLine: `
      <p>${
        convocationFile
          ? "Vous trouverez toutes les informations importantes dans la convocation officielle disponible en pièce jointe de cet e-mail."
          : "Le certificateur vous fera parvenir la convocation officielle par courrier. Vous y trouverez toutes les informations importantes et tous les détails nécessaires."
      }</p>
      <p>L'équipe France VAE.</p>
        `,
          url,
        }),
      );

    return sendEmailWithLink({
      to: { email },
      htmlContent,
      subject: "Convocation de passage devant un jury VAE",
      attachment,
      app: "candidate",
    });
  }
};
