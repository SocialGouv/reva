import mjml2html from "mjml";

import { sendEmailWithLink, sendGenericEmail } from "../shared/email";
import { logger } from "../shared/logger";

const template = ({
  headline,
  headlineDsfr,
  content,
  labelCTA,
  url,
  hideFranceVaeLogo,
  bottomLine,
}: {
  headline?: string;
  headlineDsfr?: string;
  content: string;
  labelCTA?: string;
  url?: string;
  hideFranceVaeLogo?: boolean;
  bottomLine?: string;
}) => `
  <mjml>
    <mj-head>
      <mj-style>
        .cta a,.cta a :visited, .cta a:hover, .cta a:active {
          color: white !important;
        }
      </mj-style>
    </mj-head>
    <mj-body>
      <mj-raw>{% if ${!!hideFranceVaeLogo} != true %}</mj-raw>
        <mj-section>
          <mj-column>
          <mj-image align="center" width="92px" height="55.65px" src="${
            process.env.BASE_URL || "https://vae.gouv.fr"
          }/fvae_logo.png"></mj-image>
        </mj-column>
        </mj-section>
      <mj-raw>{% endif %}</mj-raw>
      <mj-section>
        <mj-column>
          ${
            headline &&
            `
          <mj-text font-size="20px" font-weight="bold" font-family="helvetica">${headline}</mj-text>
          `
          }
          ${
            headlineDsfr &&
            `
            <mj-text color="#000091" font-size="32px" font-weight="700" font-family="helvetica">${headlineDsfr}</mj-text>
            `
          }
          <mj-text font-size="14px" line-height="18px" font-family="helvetica" >
            ${content}
          </mj-text>
          ${
            labelCTA &&
            `
          <mj-button css-class="cta" border-radius="4px" font-family="Helvetica" background-color="#1E293B" color="white" href="${url}">
            ${labelCTA}
           </mj-button>
          `
          }
         ${
           bottomLine &&
           `<mj-text font-size="14px" font-family="helvetica" >
          ${bottomLine || ""}
        </mj-text>}`
         }
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

export const sendPreventOrganismCandidateChangeOrganismEmail = async ({
  email,
  candidateFullName,
  certificationName,
  date,
}: {
  email: string;
  candidateFullName: string;
  certificationName: string;
  date: Date | null;
}) => {
  const htmlContent = mjml2html(
    template({
      content: `<p>Bonjour,</p><p>France VAE vous informe que <strong>${candidateFullName}</strong> a choisi un autre Architecte Accompagnateur de Parcours pour l’accompagner dans son projet de <i>"${certificationName}"</i>.</p>
          <p>Ce candidat n’est désormais plus dans votre portefeuille.</p>
          ${
            date
              ? `<p>De fait, le rendez-vous planifié le <strong>${date.toLocaleDateString(
                  "fr-FR"
                )}</strong> est donc annulé. </p>`
              : ""
          }

          <p>L’équipe France VAE.</p>
        `,
    })
  );

  if (htmlContent.errors.length > 0) {
    const errorMessage = htmlContent.errors
      .map((e) => e.formattedMessage)
      .join("\n");
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Un de vos candidats a changé d’accompagnateur",
  });
};

export const sendNewEmailCandidateEmail = ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        content: `
        <p>Bonjour,</p>
        <p>Vous avez demandé à changer votre e-mail sur France VAE. Pour valider cette demande, merci de cliquer sur le boutton ci-dessous.</p>      
        `,
        url,
        labelCTA: "Confirmer mon e-mail",
        bottomLine: `
        <p>Ce lien est valide 1 heure et ne peut être utilisé qu’une fois.</p>
        <p>Cet e-mail sera désormais votre nouvel identifiant, il vous sera utile pour vous connecter à France VAE.</p>
        <p>L’équipe France VAE.</p>`,
      })
    );

  return sendEmailWithLink({
    email,
    subject: "Votre e-mail sur France VAE a été changé",
    htmlContent,
    token,
    action: "confirmEmail",
  });
};

export const sendPreviousEmailCandidateEmail = ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = mjml2html(
    template({
      content: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à changer votre e-mail sur France VAE, sachez que la modification a été effectuée.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement le support par email à <a href='mailto:support@vae.gouv.fr'>support@vae.gouv.fr</a>.</p>
      <p>L’équipe France VAE.</p>
        `,
    })
  );

  return sendGenericEmail({
    to: { email },
    subject: "Votre e-mail sur France VAE a été changé",
    htmlContent: htmlContent.html,
  });
};

export const sendCandidacyDropOutEmail = async (email: string) => {
  const htmlContent = mjml2html(
    template({
      headlineDsfr: `<div>Votre accompagnateur a déclaré votre abandon de candidature</div>`,
      content: `
      <p>Nous vous informons que dans le cadre de votre parcours de VAE, votre conseiller a placé votre candidature en abandon.</p>
      <p>Si vous souhaitez contester cette décision veuillez nous contacter rapidement sur le mail <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
      <p>Sans retour de votre part, l’abandon sera effectif dans un délai de 15 jours à compter de la réception de ce message.</p>
      <p>L’équipe France VAE.</p>
        `,
    })
  );

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre accompagnateur a déclaré votre abandon de candidature",
  });
};
