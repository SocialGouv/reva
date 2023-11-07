import mjml2html from "mjml";

import { sendGenericEmail } from "../shared/email";
import { logger } from "../shared/logger";

const template = ({
  headline,
  content,
  labelCTA,
  url,
  hideFranceVaeLogo,
}: {
  headline?: string;
  content: string;
  labelCTA?: string;
  url?: string;
  hideFranceVaeLogo?: boolean;
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
  date: Date;
}) => {
  const htmlContent = mjml2html(
    template({
      content: `<p>Bonjour,</p><p>France VAE vous informe que <strong>${candidateFullName}</strong> a choisi un autre Architecte Accompagnateur de Parcours pour l’accompagner dans son projet de <i>"${certificationName}"</i>.</p>
          <p>Ce candidat n’est désormais plus dans votre portefeuille.</p>
          <p>De fait, le rendez-vous planifié le <strong>${date.toLocaleDateString(
            "fr-FR"
          )}</strong> est donc annulé. </p>

          <p>L’équipe France VAE.</p>
        `,
      labelCTA: "Accéder au dossier",
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
    subject: "Un de vos candidats a changé d’accompagnateur",
  });
};
