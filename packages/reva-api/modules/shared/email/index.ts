import mjml2html from "mjml";
import { Either, Left, Right } from "purify-ts";
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
      <mj-image align="center" width="92px" height="55.65px" src="${
        process.env.BASE_URL || "https://vae.gouv.fr"
      }/fvae_logo.png"></mj-image>
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
          "<strong>Commencez</strong> dès maintenant votre parcours France VAE en cliquant sur le bouton ci-dessous.",
        labelCTA: "Démarrer mon parcours",
        url,
      })
    );

  return sendEmailWithLink(email, token, "registration", htmlContent);
};

export const sendLoginEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline:
          "<strong>Retrouvez</strong> dès maintenant votre candidature France VAE en cliquant sur le bouton ci-dessous.",
        labelCTA: "Reprendre mon parcours",
        url,
      })
    );

  return sendEmailWithLink(email, token, "login", htmlContent);
};

export const sendUnknownUserEmail = async (email: string) => {
  const htmlContent = `Vous avez demandé à recevoir un lien pour vous connecter mais votre e-mail n’existe pas dans notre base.
    <br>
    <ul>
      <li>Si vous avez une candidature en cours sur le site de l’Education Nationale (ex : DAVA), votre candidature est disponible sur le site dédié <a href="https://vae.education.gouv.fr/">https://vae.education.gouv.fr/</a>.</li>
      <li>Si vous avez plusieurs adresses e-mails, peut-être n’avez-vous pas renseigné la bonne pour retrouver votre dossier.</li>
      <li>Si vous n’avez pas encore créé de compte, <a href="https://vae.gouv.fr/app/">vous devez d’abord vous inscrire</a>.</li>
    </ul>
    <br>
    L’équipe France VAE`;

  return sendGenericEmail({
    htmlContent: htmlContent,
    to: { email },
    subject:
      "Nous n’avons pas trouvé de compte France VAE correspondant à votre e-mail",
  });
};

const sendEmailWithLink = async (
  email: string,
  token: string,
  action: "registration" | "login",
  htmlContent: (url: string) => { html: string }
) => {
  const url = `${process.env.BASE_URL}/app/${action}?token=${token}`;
  const emailContent = htmlContent(url);

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL URL =======");
    logger.info(url);
    logger.info("=========================");
    return Right("result");
  }
  return sendGenericEmail({
    htmlContent: emailContent.html,
    to: { email },
    subject: "Votre accès à votre parcours France VAE",
  });
};

interface GenericEmailArgs {
  to: EmailAccount;
  subject: string;
  htmlContent: string;
  sender?: EmailAccount;
}

export const sendGenericEmail = async ({
  to,
  htmlContent,
  sender,
  subject,
}: GenericEmailArgs): Promise<Either<string, string>> => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  try {
    await apiInstance.sendTransacEmail(
      Object.assign(sendSmtpEmail, {
        sender: sender ?? { email: "contact@vae.gouv.fr" },
        to: [to],
        subject,
        htmlContent,
        tags: [process.env.APP_ENV ?? "development"],
      })
    );
    logger.info(`email sent to ${to.email}`);
    return Right(`email sent to ${to.email}`);
  } catch (e) {
    logger.error("error", e);
    return Left("error");
  }
};
