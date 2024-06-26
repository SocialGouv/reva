import { MATOMO } from "@/config/config";
import { DocumentProps, Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

import { dsfrDocumentApi } from "./_app";

const { getColorSchemeHtmlAttributes, augmentDocumentForDsfr } =
  dsfrDocumentApi;

export default function Document(props: DocumentProps) {
  const tarteaucitronScript = `
    var script = document.createElement("script");

    var matomoServiceInit = function() {
      window.tarteaucitron.user.matomotmUrl = "${MATOMO.URL}/js/container_${MATOMO.CONTAINER_NAME}.js";
      (window.tarteaucitron.job = window.tarteaucitron.job || []).push("matomotm");
    };

    script.src = "/vendor/tarteaucitronjs/tarteaucitron.js";
    script.onload = function () {
      if (typeof window !== "undefined") {
        window.tarteaucitron.init({
          useExternalCss: true,
          removeCredit: true,
          iconPosition: "BottomLeft",
        });
        matomoServiceInit();
      }
    };

    document.head.appendChild(script);
  `;

  // The tarteaucitron lib waits for the document load event to initialize itself
  // (cf "window.addEventListener("load", function ()" in the tarteaucitron.js file)
  // To avoid cases where tarteaucitron doesn't start because the document is already loaded,
  // we need to use Script here, with the beforeInteractive strategy.
  // onLoad can't be used with the beforeInteractive strategy, so we manually
  // create a script tag in order to attach the required onLoad callback
  return (
    <Html {...getColorSchemeHtmlAttributes(props)} lang="fr">
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
          {tarteaucitronScript}
        </Script>
      </body>
    </Html>
  );
}

augmentDocumentForDsfr(Document);
