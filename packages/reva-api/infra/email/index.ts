import mjml2html from "mjml";
import { Left, Right } from "purify-ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";

import { logger } from "../logger";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY || "secret";

const template = ({
  headline,
  labelCTA,
  url,
}: {
  headline: string;
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
      <mj-image align="center" width="60px" height="23.8px" src="${
        process.env.BASE_URL || "https://reva.beta.gouv.fr"
      }/admin/logo.png"></mj-image>
    </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="bold" font-family="helvetica">Merci !</mj-text>
        <mj-text font-size="14px" font-family="helvetica" >
          ${headline}
        </mj-text>
        <mj-button css-class="cta" border-radius="4px" font-family="Helvetica" background-color="#1E293B" color="white" href="${url}">
          ${labelCTA}
         </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

export const sendRegistrationEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline:
          "<strong>Commencez</strong> dès maintenant votre parcours VAE REVA en cliquant sur le bouton ci-dessous.",
        labelCTA: "Démarrer mon parcours",
        url,
      })
    );

  return sendEmail(email, token, htmlContent);
};

export const sendProRegistrationEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline:
          "<strong>Félicitaions</strong>, votre compte Reva vient d'être vérifié. Vous pouvez accéder dès à présent à votre espace professionnel !",
        labelCTA: "Activer mon compte",
        url,
      })
    );

  return sendEmail(email, token, htmlContent);
};

export const sendProRejectionEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline:
          "Navré, votre compte Reva n’a pas pu être vérifié.",
        labelCTA: "Consulter ma demande",
        url,
      })
    );

  return sendEmail(email, token, htmlContent);
};

export const sendLoginEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline:
          "<strong>Retrouvez</strong> dès maintenant votre candidature VAE REVA en cliquant sur le bouton ci-dessous.",
        labelCTA: "Reprendre mon parcours",
        url,
      })
    );

  return sendEmail(email, token, htmlContent);
};

const sendEmail = async (
  email: string,
  token: string,
  htmlContent: (url: string) => { html: string }
) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  const url = `${process.env.BASE_URL}/app/login?token=${token}`;
  const emailContent = htmlContent(url);
  sendSmtpEmail.sender = { email: "hello@reva.beta.gouv.fr" };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = "Votre accès à votre parcours VAE - REVA";
  sendSmtpEmail.htmlContent = emailContent.html;
  sendSmtpEmail.tags = [process.env.APP_ENV || "development"];

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(emailContent.html);
    logger.info("=========================");
    logger.info("======= EMAIL URL =======");
    logger.info(url);
    logger.info("=========================");

    return Right("result");
  }
  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return Right(`email sent to ${email}`);
  } catch (e) {
    logger.error("error", e);
    return Left("error");
  }
};
