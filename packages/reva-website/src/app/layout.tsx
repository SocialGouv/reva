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
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { tarteaucitronScript } from "@/components/script/TarteaucitronScript";
import { PRODUKTLY_CLIENT_TOKEN } from "@/config/config";

import { DsfrProvider, StartDsfrOnHydration } from "./_components/dsfr";
// import { getHtmlAttributes } from "./_components/dsfr/server-only-index";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const matomoBaseUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoContainerName = process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME;
  const lang = "fr";
  const queryClient = new QueryClient();

  return (
    //should use  <html {...getHtmlAttributes({ lang })} ... but calling getHtmlAttributes clashes with tailwind css overrides for unknown reasons
    <html
      lang={lang}
      data-fr-scheme="light"
      data-fr-theme="light"
      data-fr-js="true"
    >
      <head>
        <StartDsfrOnHydration />
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
          <Toaster position="top-right" />
        </DsfrProvider>
        {matomoBaseUrl && matomoContainerName && (
          <Script strategy="beforeInteractive" id="tarteaucitron-wrapper">
            {tarteaucitronScript({
              matomoUrl: `${matomoBaseUrl}/js/container_${matomoContainerName}.js`,
              produktlyClientToken: PRODUKTLY_CLIENT_TOKEN,
            })}
          </Script>
        )}
      </body>
    </html>
  );
}
