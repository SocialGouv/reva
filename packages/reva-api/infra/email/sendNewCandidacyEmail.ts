import mjml2html from "mjml";

import { sendGenericEmail } from ".";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

export const sendNewCandidacyEmail = (to: string) => {
  return sendGenericEmail({
    subject: "Une nouvelle candidature est arrivée",
    to: {
      email: to,
    },
    sender: {
      email: "support@vae.gouv.fr",
      name: "France VAE",
    },
    htmlContent: mjml2html(`
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
      <mj-image align="center" width="92px" height="55.65px" src="${baseUrl}/fvae_logo.png"></mj-image>
    </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px" font-family="helvetica">
          Bonjour,<br/><br/><br/><br/>
          Une nouvelle candidature VAE est disponible dans votre espace de travail.<br/><br/>
          Connectez-vous pour y accéder.<br/>
        </mj-text>
        <mj-button css-class="cta" border-radius="4px" font-family="Helvetica" background-color="#1E293B" color="white" href="${baseUrl}/admin">
          Accéder à mon espace
        </mj-button>
        <mj-text font-size="16px" font-family="helvetica">
          L'équipe France VAE.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`).html,
  });
};
