export const templateEmailPurifyJS = ({
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
