interface TemplateParams {
  headline: string;
  message: string;
  cta?: {
    label: string;
    url: string;
  };
  details?: string[];
}
export const template = ({
  headline,
  message,
  cta,
  details,
}: TemplateParams) => {
  const detailsHtml = details ? makeUnorderedList(details) : "";
  return `
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
        process.env.BASE_URL || "https://reva.beta.gouv.fr"
      }/fvae_logo.png"></mj-image>
    </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="bold" font-family="helvetica">${headline}</mj-text>
        <mj-text font-size="14px" font-family="helvetica" >
          ${message}
        </mj-text>
        ${detailsHtml}
        ${
          cta
            ? `
            <mj-button css-class="cta" border-radius="4px" font-family="Helvetica" background-color="#1E293B" color="white" href="${cta.url}">
              ${cta.label}
            </mj-button>
            `
            : ""
        }
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
};

function makeUnorderedList(items: string[]): string {
  return items.map((text) => `<mj-text>- ${text}</mj-text>`).join("");
}
