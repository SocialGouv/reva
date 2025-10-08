"use client";

// 1 - globals.css - Order of imports is important
import "@/styles/globals.css";
// 2 - dsfr-theme-tac.min.css - Order of imports is important
import "@/styles/dsfr-theme-tac.min.css";
// 3 - dsfr-theme-tac-extra.css - Order of imports is important
import "@/styles/dsfr-theme-tac-extra.css";
// 4 - ckeditor5-content-styles.css - Order of imports is important
import "@/styles/ckeditor5-content-styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { KeycloakProvider } from "@/components/auth/keycloak.context";
import { DsfrProvider, StartDsfrOnHydration } from "@/components/dsfr";
import { tarteaucitronScript } from "@/components/script/TarteaucitronScript";

import { AuthGuard } from "./_components/guards/AuthGuard";
import { AppLayout } from "./_components/layout/AppLayout";
import { MainContent } from "./_components/layout/MainContent";

const queryClient = new QueryClient();

setDefaultOptions({ locale: fr });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const matomoBaseUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoContainerName = process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME;

  const lang = "fr";

  return (
    <html
      //should use  <html {...getHtmlAttributes({ lang })} ... but calling getHtmlAttributes clashes with tailwind css overrides for unknown reasons
      // {...getHtmlAttributes({ lang })}
      lang={lang}
    >
      <head>
        <StartDsfrOnHydration />

        <title>France VAE</title>
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <KeycloakProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster position="top-right" />
              <AppLayout>
                <MainContent>
                  <AuthGuard>{children}</AuthGuard>
                </MainContent>
              </AppLayout>
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
          matomoBaseUrl && matomoContainerName && (
            <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
              {tarteaucitronScript({
                matomoUrl: `${matomoBaseUrl}/js/container_${matomoContainerName}.js`,
              })}
            </Script>
          )
        }
      </body>
    </html>
  );
}
