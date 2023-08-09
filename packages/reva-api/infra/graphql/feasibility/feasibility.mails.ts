import mjml2html from "mjml";

import { sendGenericEmail } from "../../email";
import { logger } from "../../logger";

const template = ({
  headline,
  content,
  labelCTA,
  url,
}: {
  headline: string;
  content: string;
  labelCTA: string;
  url: string;
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
      <mj-section>
        <mj-column>
        <mj-image align="center" width="92px" height="55.65px" src="${
          process.env.BASE_URL || "https://vae.gouv.fr"
        }/fvae_logo.png"></mj-image>
      </mj-column>
      </mj-section>
      <mj-section>
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" font-family="helvetica">${headline}</mj-text>
          <mj-text font-size="14px" font-family="helvetica" >
            ${content}
          </mj-text>
          <mj-button css-class="cta" border-radius="4px" font-family="Helvetica" background-color="#1E293B" color="white" href="${url}">
            ${labelCTA}
           </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

export const sendNewFeasibilitySubmittedEmail = async ({
  email,
  feasibilityUrl,
}: {
  email: string;
  feasibilityUrl: string;
}) => {
  const htmlContent = mjml2html(
    template({
      headline: `<p>Bonjour,</p><p>`,
      content: `Un nouveau dossier de faisabilité vous a été transmis. Vous pouvez y accéder dès maintenant en cliquant sur le bouton ci-dessous.</p>
          <p>Nous vous rappelons que vous disposez d’un délai de 15 jours pour prononcer la recevabilité du dossier.</p>
          <p>L’équipe France VAE.</p>
        `,
      labelCTA: "Accéder au dossier",
      url: feasibilityUrl,
    })
  );

  if (htmlContent.errors.length > 0) {
    const errorMessage = htmlContent.errors
      .map((e) => e.formattedMessage)
      .join("\n");
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent.html);
    logger.info("=========================");
  }
  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Un nouveau dossier de faisabilité est en attente",
  });
};
