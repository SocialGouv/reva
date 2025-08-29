"use client";
import "@/styles/globals.css";
import "@/styles/dsfr-theme-tac.min.css";
import "@/styles/dsfr-theme-tac-extra.css";
import "@/styles/ckeditor5-content-styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Script from "next/script";

import { tarteaucitronScript } from "@/components/script/TarteaucitronScript";
import { PRODUKTLY_CLIENT_TOKEN } from "@/config/config";

import { DsfrProvider, StartDsfrOnHydration } from "./_components/dsfr";
import { DsfrHead } from "./_components/dsfr/DsfrHead";

export const revalidate = 600;

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
        <DsfrHead />
      </head>
      <body>
        <DsfrProvider lang={lang}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
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
