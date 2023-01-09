import mjml2html from "mjml";
import { Left, Right } from "purify-ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY || "secret";

const template = ({
  headline,
  labelCTA,
  url
}: {
  headline: string,
  labelCTA: string,
  url: string
}) => (`
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
      <mj-image align="center" width="60px" height="23.8px" src="data:image/png;base64,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"></mj-image>
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
`)

export const sendRegistrationEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(template({
      headline: "<strong>Commencez</strong> dès maintenant votre parcours VAE REVA en cliquant sur le bouton ci-dessous.",
      labelCTA: "Démarrer mon parcours",
      url
    }));

  return sendEmail(email, token, htmlContent);
};

export const sendLoginEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
  mjml2html(template({
    headline: "<strong>Retrouvez</strong> dès maintenant votre candidature VAE REVA en cliquant sur le bouton ci-dessous.",
    labelCTA: "Reprendre mon parcours",
    url
  }));

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
  const emailContent = htmlContent(url)
  sendSmtpEmail.sender = { email: "hello@reva.beta.gouv.fr" };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = "Votre accès à votre parcours VAE - REVA";
  sendSmtpEmail.htmlContent = emailContent.html;
  sendSmtpEmail.tags = [process.env.APP_ENV || "development"];

  if (process.env.NODE_ENV !== "production") {
    console.log("======= EMAIL CONTENT =======");
    console.log(emailContent.html);
    console.log("=========================");
    console.log("======= EMAIL URL =======");
    console.log(url);
    console.log("=========================");
    
    return Right("result");
  }
  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return Right(`email sent to ${email}`);
  } catch (e) {
    console.log("error", e);
    return Left("error");
  }
};
