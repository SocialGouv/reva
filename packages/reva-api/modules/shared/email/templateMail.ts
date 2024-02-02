export const templateMail = ({
  headline,
  headlineDsfr,
  content,
  labelCTA,
  url,
  hideFranceVaeLogo,
  bottomLine,
  disableThanks = true,
}: {
  headline?: string;
  headlineDsfr?: string;
  content: string;
  labelCTA?: string;
  url?: string;
  hideFranceVaeLogo?: boolean;
  bottomLine?: string;
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
               !disableThanks &&
               '<mj-text font-size="20px" font-weight="bold" font-family="helvetica">Merci !</mj-text>'
             }
          ${
            headline &&
            `
          <mj-text font-size="20px" font-weight="bold" font-family="helvetica">${headline}</mj-text>
          `
          }
          ${
            headlineDsfr &&
            `
            <mj-text color="#000091" font-size="32px" font-weight="700" font-family="helvetica">${headlineDsfr}</mj-text>
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
         ${
           bottomLine &&
           `<mj-text font-size="14px" font-family="helvetica" >
          ${bottomLine || ""}
        </mj-text>}`
         }
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;
