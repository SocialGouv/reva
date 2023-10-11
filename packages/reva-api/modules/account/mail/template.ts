interface TemplateParams {
  headline?: string;
  message: string;
}
export const template = ({ headline = "", message }: TemplateParams) => `
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
          ${message}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
