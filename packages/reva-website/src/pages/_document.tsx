import { tarteaucitronScript } from "@/components/script/TarteaucitronScript";
import { DocumentProps, Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

import { dsfrDocumentApi } from "./_app";

const { getColorSchemeHtmlAttributes, augmentDocumentForDsfr } =
  dsfrDocumentApi;

export default function Document(props: DocumentProps) {
  const matomoBaseUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoContainerName = process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME;

  // The tarteaucitron lib waits for the document load event to initialize itself
  // (cf "window.addEventListener("load", function ()" in the tarteaucitron.js file)
  // To avoid cases where tarteaucitron doesn't start because the document is already loaded,
  // we need to use Script in _document.tsx with the beforeInteractive strategy.
  // onLoad can't be used with the beforeInteractive strategy, so we manually
  // create a script tag in order to attach the required onLoad callback
  return (
    <Html {...getColorSchemeHtmlAttributes(props)} lang="fr">
      <Head />
      <body>
        <Main />
        <NextScript />
        {matomoBaseUrl && matomoContainerName && (
          <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
            {tarteaucitronScript({
              matomoUrl: `${matomoBaseUrl}/js/container_${matomoContainerName}.js`,
            })}
          </Script>
        )}
        <Script
          strategy="afterInteractive"
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="IilegiI0JSnsGyYBNrL/cg"
        />
      </body>
    </Html>
  );
}

augmentDocumentForDsfr(Document);
