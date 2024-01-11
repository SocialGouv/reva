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
  bottomline,
  url,
  disableThanks,
}: {
  headline: string;
  labelCTA: string;
  bottomline?: string;
  url: string;
  disableThanks?: boolean;
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
      ${
        !disableThanks &&
        '<mj-text font-size="20px" font-weight="bold" font-family="helvetica">Merci !</mj-text>'
      }
        <mj-text font-size="14px" font-family="helvetica" >
          ${headline}
        </mj-text>
        <mj-button css-class="cta" border-radius="4px" font-family="Helvetica" background-color="#1E293B" color="white" href="${url}">
          ${labelCTA}
        </mj-button>
        <mj-text font-size="14px" font-family="helvetica" >
          ${bottomline || ""}
        </mj-text>
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

  return sendEmailWithLink({
    email,
    token,
    action: "registration",
    htmlContent,
  });
};

export const sendLoginEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline:
          "Bonjour, vous avez demandé à accéder à votre compte France VAE, retrouvez votre dossier dès maintenant en cliquant sur le bouton ci-dessous.",
        labelCTA: "Reprendre mon parcours",
        url,
        bottomline:
          "Si vous n'êtes pas à l'origine de cette demande, merci de ne pas tenir compte de cet e-mail.<br /><br />Ce lien est valide 1 heure et ne peut être utilisé qu’une fois.<br /><br />L’équipe France VAE",
        disableThanks: true,
      })
    );

  return sendEmailWithLink({
    email,
    token,
    action: "login",
    htmlContent,
    subject: "Accédez à votre compte France VAE",
  });
};

export const sendTrainingEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      template({
        headline: `
          Vous vous êtes engagé·e dans une démarche de VAE.
          <br />
          <br />
          Après échanges avec votre Architecte Accompagnateur de Parcours, vous avez défini le parcours le plus adapté à votre situation et à votre projet.
          <br />
          <br />
          Il est désormais prêt.
          <br />
          <br />
          Nous vous invitons à le valider au plus vite. Il vous suffit de cliquer sur le bouton ci-dessous.
          <br />
          <br />
          Ce lien est valable 4 jours. 
        `,
        labelCTA: "Accéder à mon parcours pédagogique",
        url,
        bottomline: `
          Cela permettra à votre architecte accompagnateur de parcours de transmettre votre dossier au certificateur et de faire la demande de financement de votre projet.
          <br />
          <br />
          Nos équipes ont élaboré <a href="https://scribehow.com/shared/Validation_du_parcours_candidat__QHFNcjJ4T56E3cSYEphpYQ">un guide en ligne pour vous aider dans cette démarche</a>.
          <br />
          <br />
          L’équipe France VAE
        `,
        disableThanks: true,
      })
    );

  return sendEmailWithLink({
    email,
    token,
    action: "login",
    htmlContent,
    subject: "Votre parcours pédagogique est prêt pour validation",
  });
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

export const sendEmailWithLink = async ({
  email,
  token,
  action,
  app = "app",
  htmlContent,
  subject,
}: {
  email: string;
  token?: string;
  action: "registration" | "login" | "confirmEmail" | "admin" | "";
  app?: "app" | "admin";
  htmlContent: (url: string) => { html: string };
  subject?: string;
}) => {
  const url = `${process.env.BASE_URL}/${app}/${action}${
    token ? `?token=${token}` : ""
  }`;
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
    subject: subject || "Votre accès à votre parcours France VAE",
  });
};

interface GenericEmailArgs {
  to: EmailAccount | EmailAccount[];
  subject: string;
  htmlContent: string;
  sender?: EmailAccount;
  attachment?: { name: string; content: string }[];
}

export const sendGenericEmail = async ({
  to,
  htmlContent,
  sender,
  subject,
  attachment,
}: GenericEmailArgs): Promise<Either<string, string>> => {
  const emailAddresses = Array.isArray(to)
    ? to.map((t) => t.email).join(", ")
    : to.email;

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent);
    logger.info("=========================");
    return Right(`email sent to ${emailAddresses}`);
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  try {
    await apiInstance.sendTransacEmail(
      Object.assign(sendSmtpEmail, {
        sender: sender ?? { name: "France VAE", email: "contact@vae.gouv.fr" },
        to: Array.isArray(to) ? to : [to],
        subject,
        htmlContent,
        attachment,
        tags: [process.env.APP_ENV ?? "development"],
      })
    );
    logger.info(`email sent to ${emailAddresses}`);
    return Right(`email sent to ${emailAddresses}`);
  } catch (e) {
    logger.error("error", e);
    return Left("error");
  }
};
