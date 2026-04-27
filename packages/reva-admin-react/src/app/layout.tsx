"use client";

// 1 - globals.css - Order of imports is important
import "@/styles/globals.css";
// 2 - dsfr-theme-tac.min.css - Order of imports is important
import "@/styles/dsfr-theme-tac.min.css";
// 3- dsfr-theme-tac-extra.css - Order of imports is important
import "@/styles/dsfr-theme-tac-extra.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import Script from "next/script";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

import { AuthGuard } from "@/components/auth/authGuard";
import { KeycloakProvider } from "@/components/auth/keycloakContext";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";
import { Produktly } from "@/components/script/Produktly";
import { tarteaucitronScript } from "@/components/script/Tarteaucitron";
import {
  MATOMO_CONTAINER_NAME,
  MATOMO_URL,
  PRODUKTLY_CLIENT_TOKEN,
} from "@/config/config";

const queryClient = new QueryClient();

setDefaultOptions({ locale: fr });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "fr";

  return (
    <html
      //should use  <html {...getHtmlAttributes({ lang })} ... but calling getHtmlAttributes clashes with tailwind css overrides for unknown reasons
      // {...getHtmlAttributes({ lang })}
      lang={lang}
    >
      <head>
        <StartDsfrOnHydration />
        {PRODUKTLY_CLIENT_TOKEN && <Produktly />}
        <title>France VAE</title>
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <KeycloakProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster position="top-right" />
              <Suspense>
                <AuthGuard>{children}</AuthGuard>
              </Suspense>
            </QueryClientProvider>
          </KeycloakProvider>
        </DsfrProvider>
        {
          // The tarteaucitron lib waits for the document load event to initialize itself
          // (cf "window.addEventListener("load", function ()" in the tarteaucitron.js file)
          // To avoid cases where tarteaucitron doesn't start because the document is already loaded,
          // we need to use Script in _document.tsx with the beforeInteractive strategy.
          // onLoad can't be used with the beforeInteractive strategy, so we manually
          // create a script tag in order to attach the required onLoad callback
          ((MATOMO_URL && MATOMO_CONTAINER_NAME) ||
            process.env.NEXT_PUBLIC_CRISP_ID) && (
            <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
              {tarteaucitronScript({
                matomoUrl: `${MATOMO_URL}/js/container_${MATOMO_CONTAINER_NAME}.js`,
                crispID: process.env.NEXT_PUBLIC_CRISP_ID || "",
              })}
            </Script>
          )
        }
      </body>
    </html>
  );
}
